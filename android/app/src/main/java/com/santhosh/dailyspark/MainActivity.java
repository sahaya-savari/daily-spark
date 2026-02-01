package com.santhosh.dailyspark;

import android.os.Bundle;
import android.webkit.WebView;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final String TAG = "DailySparkMain";
  
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    
    Log.d(TAG, "MainActivity onCreate started");
    
    // Enable WebView debugging
    WebView.setWebContentsDebuggingEnabled(true);
    
    Log.d(TAG, "WebView debugging enabled");
  }
  
  @Override
  public void onStart() {
    super.onStart();
    Log.d(TAG, "MainActivity onStart - Bridge should load now");
  }
}
