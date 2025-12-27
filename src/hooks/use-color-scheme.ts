import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  type PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ColorSchemeName,
  useColorScheme as useRNColorScheme,
} from "react-native";

type ColorSchemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "hitorigoto:colorSchemePreference";

type ColorSchemeContextValue = {
  preference: ColorSchemePreference;
  colorScheme: "light" | "dark";
  isReady: boolean;
  setPreference: (preference: ColorSchemePreference) => void;
  toggleColorScheme: () => void;
};

const ColorSchemeContext = createContext<ColorSchemeContextValue | null>(null);

function normalizePreference(value: string | null): ColorSchemePreference {
  if (value === "light" || value === "dark" || value === "system") return value;
  return "system";
}

export function ColorSchemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useRNColorScheme();
  const [preference, setPreferenceState] =
    useState<ColorSchemePreference>("system");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled) setPreferenceState(normalizePreference(stored));
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const effectiveScheme = useMemo<"light" | "dark">(() => {
    if (preference === "system")
      return (systemScheme ?? "light") === "dark" ? "dark" : "light";
    return preference;
  }, [preference, systemScheme]);

  const setPreference = useCallback((next: ColorSchemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // ignore persistence failures
    });
  }, []);

  const toggleColorScheme = useCallback(() => {
    setPreference(effectiveScheme === "dark" ? "light" : "dark");
  }, [effectiveScheme, setPreference]);

  const value = useMemo<ColorSchemeContextValue>(
    () => ({
      preference,
      colorScheme: effectiveScheme,
      isReady,
      setPreference,
      toggleColorScheme,
    }),
    [effectiveScheme, isReady, preference, setPreference, toggleColorScheme]
  );

  return React.createElement(ColorSchemeContext.Provider, { value }, children);
}

/**
 * Returns the app's effective color scheme.
 * - If user preference is set, that wins.
 * - Otherwise, falls back to the system scheme.
 */
export function useColorScheme(): ColorSchemeName {
  const systemScheme = useRNColorScheme();
  const ctx = useContext(ColorSchemeContext);
  if (ctx) return ctx.colorScheme;
  return systemScheme ?? "light";
}

export function useColorSchemePreference() {
  const systemScheme = useRNColorScheme();
  const ctx = useContext(ColorSchemeContext);
  if (!ctx) {
    return {
      preference: "system" as const,
      colorScheme: (systemScheme ?? "light") as "light" | "dark",
      isReady: true,
      setPreference: () => {},
      toggleColorScheme: () => {},
    };
  }
  return ctx;
}
