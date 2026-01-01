import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getSettings, updateSettings, clearAllData } from '../../src/services/storage';
import { Settings } from '../../src/types';
import { Footer } from '../../src/components/Footer';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import { APP_CONFIG } from '../../src/constants/config';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    notificationsEnabled: true,
    ttsEnabled: true,
    theme: 'auto',
    language: 'en',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await getSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleToggle = async (key: keyof Settings, value: boolean) => {
    try {
      await updateSettings({ [key]: value });
      setSettings({ ...settings, [key]: value });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all tasks? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'All tasks have been deleted');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notifications</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders for your tasks
                </Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => handleToggle('notificationsEnabled', value)}
                trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                thumbColor={COLORS.text}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Voice Notifications</Text>
                <Text style={styles.settingDescription}>
                  Play audio for task reminders
                </Text>
              </View>
              <Switch
                value={settings.ttsEnabled}
                onValueChange={(value) => handleToggle('ttsEnabled', value)}
                trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                thumbColor={COLORS.text}
                disabled={!settings.notificationsEnabled}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearCache}
            >
              <Text style={styles.dangerButtonText}>🗑️ Clear All Tasks</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <View style={styles.aboutCard}>
              <Text style={styles.appNameText}>{APP_CONFIG.name}</Text>
              <Text style={styles.versionText}>Version {APP_CONFIG.version}</Text>
              <Text style={styles.developerText}>
                Developed by {APP_CONFIG.developers}
              </Text>
              
              <View style={styles.featureList}>
                <Text style={styles.featureTitle}>Features:</Text>
                <Text style={styles.featureItem}>✓ Calendar view with task indicators</Text>
                <Text style={styles.featureItem}>✓ Smart reminder system</Text>
                <Text style={styles.featureItem}>✓ Voice task creation</Text>
                <Text style={styles.featureItem}>✓ Text-to-speech notifications</Text>
                <Text style={styles.featureItem}>✓ Offline-first architecture</Text>
                <Text style={styles.featureItem}>✓ Cross-platform support</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Reminder Schedule:</Text>
            <Text style={styles.infoText}>• Tasks more than 1 day away: Reminder 3 days before</Text>
            <Text style={styles.infoText}>• Tasks on same day: Reminder 3 hours before (or 9 AM)</Text>
            <Text style={styles.infoText}>• All tasks: Reminder at task time (or 9 AM)</Text>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dangerButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  aboutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  appNameText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  versionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  developerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featureList: {
    marginTop: SPACING.md,
  },
  featureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  featureItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  infoSection: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 20,
  },
});
