package com.santhosh.dailyspark2;

import android.app.AlertDialog;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  private boolean exitDialogVisible = false;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // ✅ Classic back button (works for button + some gestures)
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        handleBack();
      }
    });

    // ✅ Predictive back gesture (Android 13+ swipe)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
        OnBackInvokedDispatcher.PRIORITY_DEFAULT,
        new OnBackInvokedCallback() {
          @Override
          public void onBackInvoked() {
            handleBack();
          }
        }
      );
    }
  }

  private void handleBack() {
    if (exitDialogVisible) return;

    WebView webView = bridge.getWebView();
    if (webView == null) return;

    // ✅ INNER PAGES → GO BACK
    if (webView.canGoBack()) {
      webView.goBack();
      return;
    }

    // ✅ HOME (NO HISTORY) → SHOW EXIT DIALOG
    showExitDialog();
  }

  private void showExitDialog() {
    exitDialogVisible = true;

    new AlertDialog.Builder(this)
      .setTitle("Exit Daily Spark?")
      .setMessage("Do you want to close the app?")
      .setPositiveButton("Exit", (d, w) -> finish())
      .setNegativeButton("Cancel", (d, w) -> exitDialogVisible = false)
      .setOnDismissListener(d -> exitDialogVisible = false)
      .setCancelable(true)
      .show();
  }
}