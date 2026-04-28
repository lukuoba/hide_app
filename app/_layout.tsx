import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppThemeProvider } from './theme';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="internal" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="gallery" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="profile" 
            options={{ 
              headerShown: false,
            }} 
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AppThemeProvider>
  );
}
