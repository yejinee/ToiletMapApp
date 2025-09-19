import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

import React, { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, Text, StyleSheet } from 'react-native';

// Splash 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

const [isReady, setIsReady] = useState(false);

useEffect(() => {
    if (loaded) {
      // 폰트 로드 끝나면 4초 후 Splash 숨기기
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
        setIsReady(true);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [loaded]);

  if (!isReady) {
    // Splash가 유지되는 동안 리액트 화면은 안 뜸
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>앱 준비 중...</Text>
      </View>
    );
  }



  // if (!loaded) {
  //   // Async font loading only occurs in development.
  //   return null;
  // }

  // return (
  //   <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  //     <Stack>
  //       <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
  //       <Stack.Screen name="+not-found" />
  //     </Stack>
  //     <StatusBar style="auto" />
  //   </ThemeProvider>
  // );


return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 메인 탭 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* not-found 페이지 */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { fontSize: 18, color: '#555' },
});