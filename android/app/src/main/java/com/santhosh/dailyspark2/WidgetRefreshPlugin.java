package com.santhosh.dailyspark2;

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
}
