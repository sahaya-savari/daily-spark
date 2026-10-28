package com.santhosh.dailyspark2;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;

public class HeatmapWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private static void updateWidget(Context context, AppWidgetManager manager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_heatmap);

        Intent openApp = new Intent(context, MainActivity.class);
        PendingIntent pendingOpen = PendingIntent.getActivity(
                context,
                0,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_heatmap_container, pendingOpen);

        // Render consistency bitmap
        int width = 480;
        int height = 180;
        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bitmap);

        Paint paint = new Paint();
        paint.setAntiAlias(true);

        // Heat colors
        int[] palette = {
                Color.parseColor("#1F2430"), // Level 0 (inactive)
                Color.parseColor("#1E3A5F"), // Level 1
                Color.parseColor("#0284C7"), // Level 2
                Color.parseColor("#38BDF8"), // Level 3
                Color.parseColor("#F29559")  // Level 4 (peak ember)
        };

        // Try reading heat levels from widget_habits.json
        int[] levels = new int[70];
        try {
            File file = new File(context.getFilesDir(), "widget_habits.json");
            if (file.exists()) {
                FileInputStream fis = new FileInputStream(file);
                byte[] data = new byte[(int) file.length()];
                int read = fis.read(data);
                fis.close();
                if (read > 0) {
                    JSONObject json = new JSONObject(new String(data, StandardCharsets.UTF_8));
                    JSONArray arr = json.optJSONArray("recentHeatLevels");
                    if (arr != null) {
                        for (int i = 0; i < Math.min(arr.length(), levels.length); i++) {
                            levels[i] = arr.optInt(i, 0);
                        }
                    }
                }
            }
        } catch (Exception e) {
            /* ignore */
        }

        // Draw 10 columns x 7 rows grid
        int cols = 10;
        int rows = 7;
        float cellSize = 22f;
        float gap = 6f;
        float startX = (width - (cols * (cellSize + gap))) / 2f;
        float startY = (height - (rows * (cellSize + gap))) / 2f;

        for (int c = 0; c < cols; c++) {
            for (int r = 0; r < rows; r++) {
                int idx = c * rows + r;
                int lvl = (idx < levels.length) ? levels[idx] : 0;
                lvl = Math.max(0, Math.min(4, lvl));

                paint.setColor(palette[lvl]);
                float left = startX + c * (cellSize + gap);
                float top = startY + r * (cellSize + gap);
                RectF rect = new RectF(left, top, left + cellSize, top + cellSize);
                canvas.drawRoundRect(rect, 4f, 4f, paint);
            }
        }

        views.setImageViewBitmap(R.id.widget_heatmap_image, bitmap);
        manager.updateAppWidget(appWidgetId, views);
    }
}

