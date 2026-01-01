import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { initDatabase, getSettings } from '../src/services/storage';
import { requestNotificationPermissions, setupNotificationListener } from '../src/services/platformNotifications';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
        const hasPermission = await requestNotificationPermissions();
        
        if (hasPermission) {
          const settings = await getSettings();
          setupNotificationListener(settings.ttsEnabled);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  if (!isReady) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.backgroundLight,
          },
          headerTintColor: COLORS.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="tasks/create" options={{ title: 'Create Task', presentation: 'modal' }} />
        <Stack.Screen name="tasks/[id]" options={{ title: 'Task Details' }} />
        <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
