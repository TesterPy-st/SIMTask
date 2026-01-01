import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { getAllTasks, getTasksByDate } from '../src/services/storage';
import { Task } from '../src/types';
import { TaskCard } from '../src/components/TaskCard';
import { Footer } from '../src/components/Footer';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../src/constants/theme';
import { getTodayString, getDayName, formatDateForStorage } from '../src/utils/dateUtils';
import { APP_CONFIG } from '../src/constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, APP_CONFIG.splashDuration);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      loadTasks();
      
      const timeInterval = setInterval(() => {
        setCurrentTime(new Date());
      }, 1000);
      
      return () => clearInterval(timeInterval);
    }
  }, [showSplash]);

  const loadTasks = async () => {
    try {
      const allTasks = await getAllTasks();
      const today = getTodayString();
      const tasksToday = await getTasksByDate(today);
      
      setTasks(allTasks);
      setTodayTasks(tasksToday);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const getMarkedDates = () => {
    const marked: any = {};
    
    tasks.forEach(task => {
      marked[task.date] = {
        marked: true,
        dotColor: COLORS.primary,
      };
    });
    
    const today = getTodayString();
    marked[today] = {
      ...marked[today],
      selected: true,
      selectedColor: COLORS.primary,
    };
    
    return marked;
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View
          style={[
            styles.splashContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📋</Text>
          </View>
          <Text style={styles.appName}>{APP_CONFIG.name}</Text>
          <Text style={styles.tagline}>Your Intelligent Task Manager</Text>
          <View style={styles.splashFooter}>
            <Text style={styles.splashDevText}>{APP_CONFIG.developers}</Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.appTitle}>{APP_CONFIG.name}</Text>
            <Text style={styles.dateText}>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.timeText}>
          {currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={getMarkedDates()}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            theme={{
              calendarBackground: COLORS.surface,
              textSectionTitleColor: COLORS.textSecondary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: COLORS.text,
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text,
              textDisabledColor: COLORS.textTertiary,
              monthTextColor: COLORS.text,
              arrowColor: COLORS.primary,
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '600',
            }}
          />
        </View>

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          {todayTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>✓</Text>
              <Text style={styles.emptyText}>No tasks for today</Text>
              <Text style={styles.emptySubtext}>Tap + to create a new task</Text>
            </View>
          ) : (
            todayTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/tasks/${task.id}`)}
              />
            ))
          )}
        </View>

        <Footer />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/tasks/create')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  splashFooter: {
    position: 'absolute',
    bottom: -200,
    alignItems: 'center',
  },
  splashDevText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  appTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  timeText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.primary,
    fontVariant: ['tabular-nums'],
  },
  settingsButton: {
    padding: SPACING.sm,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  todaySection: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  fabIcon: {
    fontSize: 32,
    color: COLORS.text,
    fontWeight: '300',
  },
});
