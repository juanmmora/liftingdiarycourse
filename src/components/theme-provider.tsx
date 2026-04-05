"use client";

import * as React from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "lifting-diary-theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    // Only access localStorage after component mounts (client-side only)
    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && (stored === "dark" || stored === "light" || stored === "system")) {
        setThemeState(stored);
      }
    } catch (error) {
      // Handle localStorage access errors gracefully
      console.warn("Failed to access localStorage for theme:", error);
    }
  }, [storageKey]);

  React.useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme, mounted, enableSystem]);

  const value = React.useMemo(() => ({
    theme,
    setTheme: (theme: Theme) => {
      if (!mounted) return;
      
      try {
        localStorage.setItem(storageKey, theme);
      } catch (error) {
        console.warn("Failed to save theme to localStorage:", error);
      }
      setThemeState(theme);
    },
  }), [theme, storageKey, mounted]);

  // Prevent hydration mismatch by rendering a consistent state on server
  if (!mounted) {
    return (
      <ThemeProviderContext.Provider value={initialState}>
        <div suppressHydrationWarning>{children}</div>
      </ThemeProviderContext.Provider>
    );
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};