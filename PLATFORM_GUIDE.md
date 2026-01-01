# SIMTask Platform Guide

## Platform Architecture

SIMTask uses automatic platform detection to provide a seamless experience across iOS, Android, and Web platforms.

## Platform Detection System

The app automatically detects the current platform at runtime and loads the appropriate implementations.

### Detection Utilities

Located in `src/utils/platformDetection.ts`:

```typescript
import { getPlatform, isWeb, isNative, isIOS, isAndroid } from '../utils/platformDetection';

// Get current platform
const platform = getPlatform(); // Returns 'ios' | 'android' | 'web'

// Check specific platforms
if (isWeb()) { /* Web-specific code */ }
if (isNative()) { /* iOS/Android code */ }
if (isIOS()) { /* iOS-specific code */ }
if (isAndroid()) { /* Android-specific code */ }
```

## Storage Layer

### Architecture

The storage layer uses a unified interface that automatically selects the correct implementation:

```
storage.ts (Unified API)
    │
    ├─> nativeStorage.ts (iOS/Android - SQLite)
    └─> webStorage.ts (Web - IndexedDB)
```

### Usage

Always import from `src/services/storage.ts`:

```typescript
import { initDatabase, createTask, getAllTasks } from '../services/storage';

// Works automatically on all platforms
await initDatabase();
const tasks = await getAllTasks();
```

### Platform Implementations

#### Native (iOS/Android)
- **Technology**: Expo SQLite 16
- **Database**: `simtask.db` in app's private storage
- **Features**: Full SQL support, transactions, indexes
- **Performance**: Optimized for large datasets

#### Web
- **Technology**: IndexedDB
- **Database**: `simtask_db` in browser storage
- **Features**: Object stores, indexes, async operations
- **Performance**: Optimized for browser environment
- **Persistence**: Survives page refreshes

### API Compatibility

Both implementations provide identical APIs:

```typescript
// Create
await createTask(taskData);

// Read
const tasks = await getAllTasks();
const task = await getTaskById(id);
const tasksOnDate = await getTasksByDate('2026-01-15');

// Update
await updateTask(id, updates);

// Delete
await deleteTask(id);

// Settings
const settings = await getSettings();
await updateSettings({ notificationsEnabled: true });

// Clear
await clearAllData();
```

## Notifications

### Platform Implementations

#### Native (iOS/Android)
- **Technology**: Expo Notifications 0.32
- **Features**:
  - Local notifications with scheduling
  - Rich notifications with images
  - Notification channels (Android)
  - Exact alarm scheduling
  - Sound and vibration control

#### Web
- **Technology**: Web Notifications API
- **Features**:
  - Browser notifications
  - Permission management
  - Basic notification display
  - Click handlers
- **Limitations**:
  - Requires user permission
  - Limited customization
  - No background scheduling (uses setTimeout)

### Usage

```typescript
import { 
  requestNotificationPermissions, 
  scheduleTaskReminders, 
  cancelTaskReminders 
} from '../services/platformNotifications';

// Request permissions (works on all platforms)
const hasPermission = await requestNotificationPermissions();

// Schedule notifications
await scheduleTaskReminders(task, ttsEnabled);

// Cancel notifications
await cancelTaskReminders(taskId);
```

## Text-to-Speech

### Platform Implementations

#### Native (iOS/Android)
- **Technology**: Expo Speech 14
- **Features**:
  - High-quality voices
  - Pitch and rate control
  - Multiple language support
  - Background playback

#### Web
- **Technology**: Web Speech API
- **Features**:
  - Browser-native voices
  - Basic speech synthesis
  - Pitch and rate control
- **Browser Support**: Chrome, Edge, Safari, Firefox

### Usage

```typescript
import { playTaskReminder, stopSpeaking } from '../services/textToSpeech';

// Play TTS (works on all platforms)
await playTaskReminder("Your task is due soon");

// Stop speaking
await stopSpeaking();
```

## Building for Each Platform

### Web

```bash
# Development
npm run web

# Production build
npx expo export --platform web
```

**Output**: Static files in `dist/` directory ready for deployment to any web server.

**Requirements**:
- Modern browser with ES6 support
- IndexedDB support
- Notifications API (optional)
- Web Speech API (optional)

### Android

```bash
# Development
npm run android

# Production build (EAS)
eas build --platform android
```

**Requirements**:
- Android 5.0+ (API 21+)
- Permissions: NOTIFICATIONS, SCHEDULE_EXACT_ALARM, RECORD_AUDIO

### iOS

```bash
# Development
npm run ios

# Production build (EAS)
eas build --platform ios
```

**Requirements**:
- iOS 13+
- Permissions: Notifications, Microphone, Speech Recognition

## Testing on Each Platform

### Web Testing

1. Start dev server: `npm run web`
2. Open browser: `http://localhost:8081`
3. Test features:
   - ✅ Create/edit/delete tasks
   - ✅ Calendar navigation
   - ✅ IndexedDB persistence
   - ✅ Web notifications (if permission granted)
   - ✅ Web Speech API (Chrome, Edge, Safari)
   - ✅ Offline functionality
   - ✅ Responsive design

### Android Testing

1. Start dev server: `npm run android`
2. Test on device or emulator
3. Test features:
   - ✅ All web features
   - ✅ SQLite persistence
   - ✅ Native notifications
   - ✅ Background notifications
   - ✅ Exact alarm scheduling
   - ✅ Haptic feedback
   - ✅ Voice input

### iOS Testing

1. Start dev server: `npm run ios`
2. Test on device or simulator
3. Test features:
   - ✅ All Android features
   - ✅ iOS-specific UI conventions
   - ✅ Native notification styling
   - ✅ Push notification integration

## Deployment

### Web Deployment

Deploy the `dist/` folder to:
- Vercel: `vercel --prod`
- Netlify: `netlify deploy --prod`
- GitHub Pages: Push to gh-pages branch
- Any static hosting service

### Android Deployment

1. Build APK/AAB: `eas build --platform android`
2. Upload to Google Play Console
3. Submit for review

### iOS Deployment

1. Build IPA: `eas build --platform ios`
2. Upload to App Store Connect
3. Submit for review

## Known Platform Differences

### Haptic Feedback
- **Native**: Full support with expo-haptics
- **Web**: Limited support (Vibration API where available)

### Voice Input
- **Native**: Uses native speech recognition
- **Web**: Uses Web Speech API (Chrome, Edge, Safari)
- **Note**: Currently simulated with text input for demo purposes

### Notifications
- **Native**: Background support with exact scheduling
- **Web**: Foreground only, requires tab open for scheduling

### Storage Limits
- **Native (SQLite)**: Virtually unlimited
- **Web (IndexedDB)**: Browser-dependent (typically 50MB-1GB)

### Offline Support
- **Native**: Full offline support
- **Web**: Full offline support with IndexedDB, but requires initial load

## Troubleshooting

### Web Build Issues

**Problem**: Module not found errors
**Solution**: Clear cache: `rm -rf .expo node_modules && npm install`

**Problem**: IndexedDB not working
**Solution**: Check browser compatibility, enable third-party cookies

### Native Build Issues

**Problem**: SQLite errors on web
**Solution**: Ensure using `storage.ts` not `database.ts` directly

**Problem**: Notification permissions denied
**Solution**: Check app settings, request permissions again

## Best Practices

1. **Always use unified services**: Import from `storage.ts`, `platformNotifications.ts`, etc.
2. **Test on all platforms**: Features may behave differently
3. **Handle permissions gracefully**: Not all users grant permissions
4. **Provide fallbacks**: For features not available on all platforms
5. **Monitor bundle size**: Web builds should be optimized
6. **Use platform detection sparingly**: Only for truly platform-specific code

## Development Workflow

1. **Development**: Test primarily on web for fast iteration
2. **Testing**: Test native builds before major releases
3. **Deployment**: Build and deploy all three platforms
4. **Monitoring**: Watch for platform-specific issues in production

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
