import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeName = 'light' | 'dark';

export type ThemeValues = {
  background: string;
  panel: string;
  card: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
  accentText: string;
  operator: string;
  operatorText: string;
  equal: string;
  equalText: string;
  button: string;
  buttonText: string;
  historyTitle: string;
  historyText: string;
  historyCard: string;
};

export const themes: Record<ThemeName, ThemeValues> = {
  light: {
    background: '#f5f7fb',
    panel: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    secondaryText: '#64748b',
    border: '#e2e8f0',
    accent: '#fb8500',
    accentText: '#ffffff',
    operator: '#fb8500',
    operatorText: '#ffffff',
    equal: '#3c8f6a',
    equalText: '#ffffff',
    button: '#e2e8f0',
    buttonText: '#0f172a',
    historyTitle: '#0f172a',
    historyText: '#334155',
    historyCard: '#ffffff',
  },
  dark: {
    background: '#070b14',
    panel: '#111827',
    card: '#111827',
    text: '#f8fafc',
    secondaryText: '#94a3b8',
    border: '#334155',
    accent: '#fb8500',
    accentText: '#ffffff',
    operator: '#fb8500',
    operatorText: '#ffffff',
    equal: '#10b981',
    equalText: '#ffffff',
    button: '#1f2937',
    buttonText: '#f8fafc',
    historyTitle: '#f8fafc',
    historyText: '#e2e8f0',
    historyCard: '#111827',
  },
};

const THEME_STORAGE_KEY = 'calculator_app_theme';

type ThemeContextType = {
  themeName: ThemeName;
  theme: ThemeValues;
  setThemeName: (name: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  themeName: 'light',
  theme: themes.light,
  setThemeName: () => {},
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>('light');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          setThemeNameState(stored);
        }
      } catch (error) {
        console.warn('加载主题失败', error);
      }
    })();
  }, []);

  const setThemeName = async (name: ThemeName) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, name);
    } catch (error) {
      console.warn('保存主题失败', error);
    }
    setThemeNameState(name);
  };

  return (
    <ThemeContext.Provider value={{ themeName, theme: themes[themeName], setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
