package com.santhosh.dailyspark2;

import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;
import android.util.AtomicFile;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

final class FolderBackup {
  private static final int JOB_ID = 48119;
  private static final long DAY = 24L * 60 * 60 * 1000;

  static SharedPreferences preferences(Context context) {
    return context.getSharedPreferences("folder_backup", Context.MODE_PRIVATE);
  }

  static synchronized void stage(Context context, String json) throws IOException {
    if (!preferences(context).contains("folder")) return;
    AtomicFile file = snapshot(context);
    FileOutputStream stream = file.startWrite();
    try {
      stream.write(json.getBytes(StandardCharsets.UTF_8));
      file.finishWrite(stream);
    } catch (IOException error) {
      file.failWrite(stream);
      throw error;
    }
  }

  static boolean hasFolderPermission(Context context, String folder) {
    if (folder == null) return false;
    for (android.content.UriPermission permission : context.getContentResolver().getPersistedUriPermissions()) {
      if (permission.isWritePermission() && permission.getUri().toString().equals(folder)) return true;
    }
    return false;
  }

  static synchronized void disconnect(Context context) {
    SharedPreferences prefs = preferences(context);
    String folder = prefs.getString("folder", null);
    prefs.edit().clear().apply();
    schedule(context);
    snapshot(context).delete();
    releaseFolder(context, folder);
  }

  static void releaseFolder(Context context, String folder) {
    if (folder == null) return;
    for (android.content.UriPermission permission : context.getContentResolver().getPersistedUriPermissions()) {
      if (!permission.getUri().toString().equals(folder)) continue;
      int flags = (permission.isReadPermission() ? android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION : 0)
        | (permission.isWritePermission() ? android.content.Intent.FLAG_GRANT_WRITE_URI_PERMISSION : 0);
      if (flags != 0) {
        try { context.getContentResolver().releasePersistableUriPermission(permission.getUri(), flags); }
        catch (SecurityException ignored) { }
      }
    }
  }

  static void schedule(Context context) {
    JobScheduler scheduler = context.getSystemService(JobScheduler.class);
    if (scheduler == null) return;
    SharedPreferences prefs = preferences(context);
    if (prefs.getString("cadence", "off").equals("off") || !prefs.contains("folder")) {
      scheduler.cancel(JOB_ID);
      return;
    }
    if (scheduler.getPendingJob(JOB_ID) != null) return;
    JobInfo info = new JobInfo.Builder(JOB_ID, new ComponentName(context, FolderBackupJob.class))
      .setPeriodic(DAY).setPersisted(true).build();
    if (scheduler.schedule(info) != JobScheduler.RESULT_SUCCESS) {
      prefs.edit().putString("error", "Android could not schedule the backup job.").apply();
    }
  }

  static synchronized void save(Context context, boolean manual) throws IOException {
    SharedPreferences prefs = preferences(context);
    String folder = prefs.getString("folder", null);
    String cadence = prefs.getString("cadence", "off");
    if (!manual && cadence.equals("off")) return;
    if (!hasFolderPermission(context, folder)) throw new IOException("Choose a backup folder with write access.");
    long now = System.currentTimeMillis();
    long last = prefs.getLong("lastScheduled", 0);
    long period = cadence.equals("weekly") ? 7 * DAY : DAY;
    if (!manual && now - last < period) return;

    byte[] data = snapshot(context).readFully();
    Uri tree = Uri.parse(folder);
    String parentId = DocumentsContract.getTreeDocumentId(tree);
    Uri parent = DocumentsContract.buildDocumentUriUsingTree(tree, parentId);
    String date = new SimpleDateFormat(manual ? "yyyy-MM-dd-HHmmss-SSS" : "yyyy-MM-dd", Locale.ROOT).format(new Date(now));
    String name = "Daily-Spark-" + date + ".json";
    android.content.ContentResolver resolver = context.getContentResolver();
    Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, parentId);
    if (!manual) {
      try (Cursor rows = resolver.query(children, new String[] { DocumentsContract.Document.COLUMN_DISPLAY_NAME }, null, null, null)) {
        if (rows != null) while (rows.moveToNext()) {
          if (name.equals(rows.getString(0))) {
            recordSuccess(prefs, now, false);
            return;
          }
        }
      }
    }
    Uri temp = DocumentsContract.createDocument(resolver, parent, "application/octet-stream", name + ".partial");
    if (temp == null) throw new IOException("The backup folder refused the file.");
    boolean committed = false;
    try {
      try (OutputStream out = resolver.openOutputStream(temp, "wt")) {
        if (out == null) throw new IOException("The backup file could not be opened.");
        out.write(data);
      }
      committed = DocumentsContract.renameDocument(resolver, temp, name) != null;
      if (!committed) throw new IOException("The backup folder does not support finalizing files.");
      recordSuccess(prefs, now, manual);
    } finally {
      if (!committed) {
        try { DocumentsContract.deleteDocument(resolver, temp); } catch (Exception ignored) { }
      }
    }
  }

  private static void recordSuccess(SharedPreferences prefs, long now, boolean manual) {
    SharedPreferences.Editor update = prefs.edit().putLong("lastSuccess", now).remove("error");
    if (!manual) update.putLong("lastScheduled", now);
    update.apply();
  }

  private static AtomicFile snapshot(Context context) {
    return new AtomicFile(new File(context.getFilesDir(), "folder-backup-staged.json"));
  }
}
