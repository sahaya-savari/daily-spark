package com.santhosh.dailyspark2;

import android.graphics.Color;

final class WidgetThemePalette {
    final int background;
    final int surface;
    final int accent;
    final int foreground;
    final int muted;
    final int[] heat;

    private WidgetThemePalette(
            int background,
            int surface,
            int accent,
            int foreground,
            int muted,
            int[] heat
    ) {
        this.background = background;
        this.surface = surface;
        this.accent = accent;
        this.foreground = foreground;
        this.muted = muted;
        this.heat = heat;
    }

    static WidgetThemePalette forMode(String mode) {
        if ("expressive".equals(mode)) {
            return new WidgetThemePalette(
                    Color.parseColor("#0A0812"),
                    Color.parseColor("#130E20"),
                    Color.parseColor("#8B5CF6"),
                    Color.WHITE,
                    Color.parseColor("#A1A1AA"),
                    colors("#171024", "#2E1065", "#5B21B6", "#7C3AED", "#8B5CF6")
            );
        }
        if ("classic".equals(mode)) {
            return new WidgetThemePalette(
                    Color.BLACK,
                    Color.parseColor("#10131B"),
                    Color.parseColor("#F59E0B"),
                    Color.parseColor("#F8FAFC"),
                    Color.parseColor("#94A3B8"),
                    colors("#242018", "#45330A", "#785B0D", "#D99E0B", "#F59E0B")
            );
        }
        return new WidgetThemePalette(
                Color.BLACK,
                Color.parseColor("#201713"),
                Color.parseColor("#BF7245"),
                Color.parseColor("#FAF7F5"),
                Color.parseColor("#A8A29E"),
                colors("#211C1B", "#2E1B13", "#5A3320", "#8F4E2B", "#BF7245")
        );
    }

    private static int[] colors(String... values) {
        int[] result = new int[values.length];
        for (int i = 0; i < values.length; i++) result[i] = Color.parseColor(values[i]);
        return result;
    }
}
