package com.santhosh.dailyspark2;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "FolderBackup")
public class FolderBackupPlugin extends Plugin {
  @PluginMethod
  public void status(PluginCall call) {
    SharedPreferences prefs = FolderBackup.preferences(getContext());
    JSObject result = new JSObject();
    String folder = prefs.getString("folder", null);
    boolean permission = FolderBackup.hasFolderPermission(getContext(), folder);
    result.put("configured", folder != null);
    result.put("writable", permission);
    result.put("cadence", prefs.getString("cadence", "off"));
    result.put("lastSuccess", prefs.getLong("lastSuccess", 0));
    result.put("error", folder != null && !permission ? "Folder access was lost. Choose the folder again." : prefs.getString("error", ""));
    call.resolve(result);
  }

  @PluginMethod
  public void chooseFolder(PluginCall call) {
    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)
      .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        | Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION);
    startActivityForResult(call, intent, "folderSelected");
  }

  @ActivityCallback
  private void folderSelected(PluginCall call, ActivityResult result) {
    if (call == null) return;
    Intent data = result.getData();
    if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
      status(call);
      return;
    }
    try {
      Uri folder = data.getData();
      int flags = data.getFlags() & (Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
      if ((flags & Intent.FLAG_GRANT_WRITE_URI_PERMISSION) == 0) throw new SecurityException();
      getContext().getContentResolver().takePersistableUriPermission(folder, flags);
      SharedPreferences prefs = FolderBackup.preferences(getContext());
      String previous = prefs.getString("folder", null);
      SharedPreferences.Editor update = prefs.edit().putString("folder", folder.toString()).remove("error");
      if (!folder.toString().equals(previous)) update.remove("lastScheduled").remove("lastSuccess");
      update.apply();
      if (!folder.toString().equals(previous)) FolderBackup.releaseFolder(getContext(), previous);
      FolderBackup.schedule(getContext());
      status(call);
    } catch (Exception error) {
      call.reject("Could not access this folder.");
    }
  }

  @PluginMethod
  public void stage(PluginCall call) {
    String json = call.getString("json");
    if (json == null) { call.reject("Missing backup data."); return; }
    try {
      FolderBackup.stage(getContext(), json);
      call.resolve();
    } catch (Exception error) {
      call.reject("Could not prepare backup data.");
    }
  }

  @PluginMethod
  public void configure(PluginCall call) {
    String cadence = call.getString("cadence", "off");
    if (!cadence.equals("off") && !cadence.equals("daily") && !cadence.equals("weekly")) {
      call.reject("Invalid backup schedule.");
      return;
    }
    FolderBackup.preferences(getContext()).edit().putString("cadence", cadence).remove("error").apply();
    FolderBackup.schedule(getContext());
    status(call);
  }

  @PluginMethod
  public void disconnect(PluginCall call) {
    FolderBackup.disconnect(getContext());
    status(call);
  }

  @PluginMethod
  public void backupNow(PluginCall call) {
    new Thread(() -> {
      try {
        FolderBackup.save(getContext(), true);
        status(call);
      } catch (Exception error) {
        FolderBackup.preferences(getContext()).edit().putString("error", "Could not save to the selected folder.").apply();
        call.reject("Could not save to the selected folder.");
      }
    }, "daily-spark-manual-backup").start();
  }
}
