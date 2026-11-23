package com.santhosh.dailyspark2;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    SplashScreen.installSplashScreen(this);
    registerPlugin(WidgetRefreshPlugin.class);
    registerPlugin(FolderBackupPlugin.class);
    super.onCreate(savedInstanceState);
  }
}
