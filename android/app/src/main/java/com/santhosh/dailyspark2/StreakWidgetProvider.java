package com.santhosh.dailyspark2;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

public class StreakWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_streak);

        Intent openApp = new Intent(context, MainActivity.class);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                context,
                0,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_streak_container, pendingOpen);

        int streak = 0;
        try {
            File file = new File(context.getFilesDir(), "widget_habits.json");
            if (file.exists()) {
                FileInputStream fis = new FileInputStream(file);
                byte[] data = new byte[(int) file.length()];
                int read = fis.read(data);
                fis.close();
                if (read > 0) {
                    JSONObject json = new JSONObject(new String(data, StandardCharsets.UTF_8));
                    streak = json.optInt("overallStreak", 0);
                }
            }
        } catch (Exception e) {
            /* fallback */
        }

        views.setTextViewText(R.id.widget_streak_count, String.valueOf(streak));
        manager.updateAppWidget(appWidgetId, views);
    }
}

