# SIMTask - Intelligent Task Manager

A production-ready Android task management application with intelligent reminders and voice capabilities.

**Developed by:** Mr. Sima & Mr. Siba

## Platform Support

SIMTask is an Android-native application built with React Native and Expo:

- ✅ **Android** - Full feature support with native APIs and permissions

### Features

| Feature | Android |
|---------|----------|
| Task Storage | SQLite |
| Notifications | expo-notifications |
| Text-to-Speech | expo-speech |
| Voice Input | Coming Soon |
| Offline Support | ✅ Full |
| Haptic Feedback | ✅ |

## Features

### Core Functionality
- **Calendar View**: Visual calendar with task indicators and easy navigation
- **Task Management**: Create, edit, delete, and organize tasks with priorities
- **Offline-First**: All data stored locally with SQLite for fast, reliable access
- **Smart Reminders**: Intelligent notification system with configurable timing
- **Text-to-Speech**: Audio notifications that read task details aloud

### Intelligent Reminder System
- **Tasks > 1 day away**: Reminder sent 3 days before task date
- **Same-day tasks**: Reminder sent 3 hours before (or 9 AM if no time specified)
- **Day-of reminder**: Always sends reminder at task time (or 9 AM)

## Technology Stack

- **Framework**: React Native 0.81 with Expo 54
- **Navigation**: Expo Router 6 (file-based routing)
- **Storage**: Expo SQLite 16
- **Notifications**: Expo Notifications 0.32
- **Speech**: Expo Speech 14
- **UI Components**: React Native core
- **Calendar**: React Native Calendars 1.13
- **Date/Time Pickers**: React Native Community DateTimePicker 8.5
- **TypeScript**: Full type safety with TypeScript 5.9

## Project Structure

```
simtask/
 ├── app/                          # Expo Router screens
 │   ├── _layout.tsx              # Root layout with initialization
 │   ├── index.tsx                # Home screen with calendar
 │   ├── tasks/
 │   │   ├── create.tsx           # Task creation
 │   │   └── [id].tsx             # Task detail/edit screen
 │   └── settings/
 │       └── index.tsx            # Settings screen
 ├── src/
 │   ├── components/              # Reusable UI components
 │   │   ├── Button.tsx
 │   │   ├── Footer.tsx
 │   │   ├── TaskCard.tsx
 │   │   └── DateTimePicker.tsx
 │   ├── services/                # Business logic services
 │   │   ├── storage.ts           # Storage interface
 │   │   ├── nativeStorage.ts     # SQLite implementation
 │   │   ├── platformNotifications.ts  # Notifications
 │   │   └── textToSpeech.ts      # Text-to-speech
 │   ├── utils/                   # Utility functions
 │   │   ├── validation.ts        # Input validation & sanitization
 │   │   ├── dateUtils.ts
 │   │   └── voiceParser.ts       # Natural language parsing
 │   ├── types/                   # TypeScript definitions
 │   │   └── index.ts
 │   └── constants/               # App constants and theme
 │       ├── theme.ts
 │       └── config.ts
 ├── assets/                      # Images and icons
 ├── app.json                     # Expo configuration
 ├── package.json
 └── README.md
 ```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- For development:
  - Android: Android Studio or Expo Go app

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
# Start Expo development server
npm start

# Run on Android
npm run android
```

### Build for Production
```bash
# Build for Android
expo build:android
```

## Usage Guide

### Creating Tasks

1. Tap the **+** (FAB) button on the home screen
2. Enter task title, date, time (optional), and description
3. Select priority level
4. Tap "Create Task"

### Managing Tasks
- **View**: Tap any task card to see full details
- **Edit**: Open task details and tap "Edit"
- **Delete**: Open task details and tap "Delete" (with confirmation)
- **Calendar**: Tasks shown with indicators on assigned dates

### Settings
- **Enable/Disable Notifications**: Toggle reminder notifications
- **Voice Notifications**: Enable/disable audio TTS for reminders
- **Clear All Tasks**: Delete all tasks (with confirmation)

## Security & Data Validation

SIMTask implements comprehensive security measures:

### Input Validation
- **Title**: Required, max 255 characters, sanitized against XSS
- **Description**: Optional, max 2000 characters, HTML tags stripped
- **Date**: Strict ISO 8601 format validation (YYYY-MM-DD)
- **Time**: 24-hour format validation (HH:mm)
- **Priority**: Enum validation (low, medium, high)

### Data Security
- **Local Storage**: All data stored securely on device (SQLite/IndexedDB)
- **No External APIs**: Zero external data transmission
- **Input Sanitization**: All user input sanitized before storage
- **XSS Protection**: HTML tags and scripts stripped from inputs
- **Type Safety**: Full TypeScript type checking

### Permissions
- **Notifications**: Requested on app launch, optional
- **Microphone** (for voice input): Requested when accessing voice feature
- **Storage**: Automatic for local data persistence

## Notification System

The app implements a smart reminder system:

1. **Advance Notice** (for tasks > 1 day away)
   - Reminder sent 3 days before task date
   - Example: Task on Jan 15 → Reminder on Jan 12

2. **Same-Day Notice**
   - Reminder sent 3 hours before task time
   - If no time specified, reminder at 9:00 AM

3. **Task Time Reminder**
   - Notification at exact task time
   - If no time specified, defaults to 9:00 AM

## Voice Command Examples

Supported natural language formats:

### Date Formats
- "tomorrow"
- "today"
- "January 15th"
- "15 January 2026"
- "next Monday"
- "next Friday"

### Time Formats
- "3 PM"
- "15:00"
- "3 o'clock"
- "in the afternoon"
- "in the evening"
- "at night"

### Complete Commands
- "Set task on 11 January 2026 as Hackathon"
- "Create task tomorrow at 3 PM called Team Meeting"
- "Remind me next Monday about Presentation"
- "Add task on Friday evening as Dinner with clients"

## Design System

### Color Palette
- **Primary**: #0A84FF (Digital blue)
- **Background**: #0A1929 (Dark navy)
- **Surface**: #1A2634 (Elevated dark)
- **Text**: #FFFFFF (White)
- **Accent**: #5EC8FF (Light blue)

### Typography
- Clean, modern sans-serif fonts
- Clear hierarchy with size and weight variations
- Optimized for readability

### Components
- **Cards**: Rounded corners with shadows
- **Buttons**: Multiple variants (primary, secondary, danger, ghost)
- **Animations**: Smooth transitions and micro-interactions

## Platform Support

### Android
- Minimum SDK: 21 (Android 5.0)
- Target SDK: Latest
- Features: Full notification support, background tasks

### iOS
- Minimum: iOS 13.0
- Features: Full notification support, Siri integration ready

### Web
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for desktop and tablet

## Offline Capabilities

- All tasks stored locally in SQLite database
- Notifications scheduled locally (no internet required)
- Text-to-speech works offline
- Full CRUD operations available offline
- Cloud sync ready (infrastructure prepared for future implementation)

## Data Model

### Task Schema
```typescript
{
  id: string;              // Unique identifier
  title: string;           // Task title (required)
  date: string;            // ISO date format (required)
  time?: string;           // HH:mm format (optional)
  description?: string;    // Task description (optional)
  priority?: 'low' | 'medium' | 'high';
  category?: string;       // Future use
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  syncStatus?: 'synced' | 'pending' | 'failed';
  reminderScheduled?: boolean;
}
```

### Settings Schema
```typescript
{
  notificationsEnabled: boolean;
  ttsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}
```

## Troubleshooting

### Notifications Not Working
1. Check notification permissions in device settings
2. Ensure "Enable Notifications" is ON in app settings
3. Verify task date/time is in the future

### Voice Input Issues
1. Grant microphone permissions
2. Ensure clear pronunciation
3. Use supported date/time formats
4. Check device microphone functionality

### Database Errors
1. Clear app data and reinstall
2. Use "Clear All Tasks" in settings
3. Check storage permissions

## Performance Optimization

- Lazy loading of task lists
- Efficient SQLite queries with indexing
- Memoized components to prevent unnecessary re-renders
- Optimized calendar rendering
- Background notification scheduling

## Security & Privacy

- All data stored locally on device
- No cloud transmission without user consent
- No tracking or analytics
- Microphone access only when explicitly requested

## Future Enhancements (Roadmap)

- Cloud sync with Firebase/Supabase
- Multi-device synchronization
- Task categories and tags
- Recurring tasks
- Task attachments
- Collaboration features
- Dark/Light theme toggle
- Multiple language support
- Widget support
- Apple Watch / Wear OS integration

## License

Copyright © 2024 Mr. Sima & Mr. Siba. All rights reserved.

## Support

For issues, questions, or feature requests, please contact the development team.

---

**Developer**: Mr. Sima & Mr. Siba
**Version**: 1.0.0
**Last Updated**: 2024
