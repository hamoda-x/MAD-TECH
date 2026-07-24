"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { useSettingsStore } from "@/store/settingsStore";
import { getSettings } from "@/lib/api";

const COLOR_PRESETS: Record<string, { light: string; dark: string }> = {
  "#0891b2": { light: "#06b6d4", dark: "#00d4ff" },
  "#7c3aed": { light: "#8b5cf6", dark: "#a78bfa" },
  "#059669": { light: "#10b981", dark: "#34d399" },
  "#ea580c": { light: "#f97316", dark: "#fb923c" },
  "#db2777": { light: "#ec4899", dark: "#f472b6" },
};

const DEFAULT_COLORS = { light: "#06b6d4", dark: "#00d4ff" };

function applyAccentColor(isDark: boolean, primaryColor?: string | null) {
  const root = document.documentElement;
  const color = primaryColor || "#0891b2";
  const preset = COLOR_PRESETS[color] || DEFAULT_COLORS;
  const accent = isDark ? preset.dark : preset.light;

  root.style.setProperty("--mad-accent", accent);
  root.style.setProperty(
    "--mad-accent-light",
    isDark ? adjustBrightness(accent, 20) : adjustBrightness(accent, 10)
  );
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDark = useThemeStore((s) => s.isDark);
  const { settings, setSettings, loaded } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    if (!loaded) {
      getSettings()
        .then((data) => {
          setSettings(data);
          applyAccentColor(isDark, data.primaryColor);
        })
        .catch(() => {
          applyAccentColor(isDark, null);
        });
    } else {
      applyAccentColor(isDark, settings?.primaryColor);
    }
  }, [isDark, settings?.primaryColor, loaded, setSettings]);

  return <>{children}</>;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
