import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: true,
            title: '计算器',
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#FF9500',
            },
            headerTitleStyle: {
              color: '#fff',
              fontSize: 18,
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="internal" 
          options={{ 
            title: '内部页',
            presentation: 'card',
            headerStyle: {
              backgroundColor: '#FF9500',
            },
            headerTitleStyle: {
              color: '#fff',
              fontSize: 18,
              fontWeight: 'bold',
            },
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
