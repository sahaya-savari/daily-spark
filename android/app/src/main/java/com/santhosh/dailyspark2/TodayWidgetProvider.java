package com.santhosh.dailyspark2;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

public class TodayWidgetProvider extends AppWidgetProvider {

    public static final String ACTION_CHECKIN_HABIT = "com.santhosh.dailyspark2.ACTION_CHECKIN_HABIT";
    public static final String EXTRA_HABIT_ID = "extra_habit_id";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_CHECKIN_HABIT.equals(intent.getAction())) {
            // Launch main app with checkin action
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            launchIntent.putExtra(EXTRA_HABIT_ID, intent.getStringExtra(EXTRA_HABIT_ID));
            context.startActivity(launchIntent);
        }
    }

    public static void updateAllWidgets(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, TodayWidgetProvider.class));
        for (int id : ids) {
            updateWidget(context, manager, id);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_today);

        // Click on widget opens app
        Intent openApp = new Intent(context, MainActivity.class);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                context,
                0,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_today_container, pendingOpen);

        // Read habits from widget_habits.json in filesDir
        try {
            File file = new File(context.getFilesDir(), "widget_habits.json");
            if (file.exists()) {
                FileInputStream fis = new FileInputStream(file);
                byte[] data = new byte[(int) file.length()];
                int read = fis.read(data);
                fis.close();

                if (read > 0) {
                    JSONObject json = new JSONObject(new String(data, StandardCharsets.UTF_8));
                    int overallStreak = json.optInt("overallStreak", 0);
                    views.setTextViewText(R.id.widget_today_streak_badge, "🔥 " + overallStreak);

                    JSONArray pendingList = json.optJSONArray("pendingHabits");
                    if (pendingList != null && pendingList.length() > 0) {
                        int[] itemIds = { R.id.widget_today_item_1, R.id.widget_today_item_2, R.id.widget_today_item_3 };
                        for (int i = 0; i < itemIds.length; i++) {
                            if (i < pendingList.length()) {
                                JSONObject item = pendingList.getJSONObject(i);
                                String name = item.optString("name", "Habit");
                                String emoji = item.optString("emoji", "⚡");
                                views.setViewVisibility(itemIds[i], View.VISIBLE);
                                views.setTextViewText(itemIds[i], emoji + "  " + name);
                            } else {
                                views.setViewVisibility(itemIds[i], View.GONE);
                            }
                        }
                    } else {
                        views.setViewVisibility(R.id.widget_today_item_1, View.VISIBLE);
                        views.setTextViewText(R.id.widget_today_item_1, "🎉 All habits complete for today!");
                        views.setViewVisibility(R.id.widget_today_item_2, View.GONE);
                        views.setViewVisibility(R.id.widget_today_item_3, View.GONE);
                    }
                }
            }
        } catch (Exception e) {
            // Fallback gracefully
        }

        manager.updateAppWidget(appWidgetId, views);
    }
}

