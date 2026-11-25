package com.santhosh.dailyspark2;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetRefresh")
public class WidgetRefreshPlugin extends Plugin {
    @PluginMethod
    public void refresh(PluginCall call) {
        TodayWidgetProvider.updateAllWidgets(getContext());
        StreakWidgetProvider.updateAllWidgets(getContext());
        HeatmapWidgetProvider.updateAllWidgets(getContext());
        JSObject result = new JSObject();
        result.put("refreshed", true);
        call.resolve(result);
    }
    @PluginMethod
    public void requestPin(PluginCall call) {
        JSObject result = new JSObject();
        AppWidgetManager manager = AppWidgetManager.getInstance(getContext());
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || !manager.isRequestPinAppWidgetSupported()) {
            result.put("requested", false);
            call.resolve(result);
            return;
        }
        String kind = call.getString("kind", "");
        Class<?> provider;
        switch (kind) {
            case "today": provider = TodayWidgetProvider.class; break;
            case "streak": provider = StreakWidgetProvider.class; break;
            case "heatmap": provider = HeatmapWidgetProvider.class; break;
            default: call.reject("Unknown widget."); return;
        }
        result.put("requested", manager.requestPinAppWidget(new ComponentName(getContext(), provider), null, null));
        call.resolve(result);
    }
}
