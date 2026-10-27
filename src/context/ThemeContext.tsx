/**
 * Contexto de tema (Light/Dark) com persistência via AsyncStorage.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { loadPreferences, saveTheme } from '../services/storageService';
import { themes, type ThemeColors } from '../themes/colors';
import type { ThemeName } from '../types/mqtt';

interface ThemeContextValue {
  theme: ThemeName;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [theme, setThemeState] = useState<ThemeName>('dark');

  // Recupera o tema salvo ao iniciar o aplicativo.
  useEffect(() => {
    let mounted = true;
    void loadPreferences().then((prefs) => {
      if (mounted) {
        setThemeState(prefs.theme);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setTheme = useCallback((next: ThemeName) => {
    setThemeState(next);
    void saveTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeName = prev === 'dark' ? 'light' : 'dark';
      void saveTheme(next);
      return next;
    });
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: themes[theme],
      isDark: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return ctx;
}
