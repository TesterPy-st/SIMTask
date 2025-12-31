# SIMTask Quick Start Guide

Get up and running with SIMTask in minutes!

## Installation

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Development Server
```bash
npm start
```

### Step 3: Run on Your Device

**Option A: Physical Device (Recommended)**
1. Install "Expo Go" app from App Store or Play Store
2. Scan the QR code shown in terminal
3. App will load on your device

**Option B: Emulator/Simulator**

**Android:**
```bash
npm run android
```
Requires Android Studio with emulator configured.

**iOS (macOS only):**
```bash
npm run ios
```
Requires Xcode with iOS Simulator.

**Web:**
```bash
npm run web
```
Opens in your default browser.

## First Launch

1. **Splash Screen**: You'll see the SIMTask logo and developer credits
2. **Permissions**: Grant notification and microphone permissions when prompted
3. **Home Screen**: You'll land on the calendar view

## Quick Actions

### Create Your First Task

**Method 1: Manual Entry**
1. Tap the blue **+** button (bottom right)
2. Enter task title (e.g., "Team Meeting")
3. Select date using the date picker
4. Optionally set time
5. Tap "Create Task"

**Method 2: Voice Input** 🎤
1. Tap the blue **+** button
2. Tap "🎤 Use Voice Input"
3. Say: "Set task on January 15th as Team Meeting at 3 PM"
4. Review parsed information
5. Tap "Create Task"

### View Your Tasks
- Today's tasks appear below the calendar
- Dates with tasks show blue dots on calendar
- Tap any task to see full details

### Edit a Task
1. Tap on a task card
2. Tap "Edit" button
3. Modify any fields
4. Tap "Save Changes"

### Delete a Task
1. Tap on a task card
2. Tap "Delete" button
3. Confirm deletion

### Configure Settings
1. Tap ⚙️ icon (top right on home screen)
2. Toggle notifications on/off
3. Toggle voice notifications on/off
4. View app information

## Understanding Reminders

SIMTask automatically schedules smart reminders:

### For Tasks More Than 1 Day Away:
- **3 days before**: "⏰ Upcoming Task - [Task Name]"

### For Tasks Today:
- **3 hours before task time**: "📅 Task Due Today! - [Task Name]"
- **At task time**: Final reminder

### Default Times:
- If no time specified, reminders default to 9:00 AM

**Example:**
```
Task: "Project Review" on January 15th at 2:00 PM

Reminders:
- January 12th at 2:00 PM (3 days before)
- January 15th at 11:00 AM (3 hours before)
- January 15th at 2:00 PM (task time)
```

## Voice Command Tips

### Supported Phrases:
```
✓ "Set task on [date] as [task name]"
✓ "Create task [date] as [task name]"
✓ "Remind me [date] about [task name]"
✓ "Add task [date] called [task name]"
```

### Date Examples:
```
✓ "tomorrow"
✓ "today"
✓ "January 15th"
✓ "15 January 2026"
✓ "next Monday"
✓ "next Friday"
```

### Time Examples:
```
✓ "at 3 PM"
✓ "at 15:00"
✓ "at 3 o'clock"
✓ "in the afternoon"
✓ "in the evening"
```

### Complete Examples:
```
✓ "Set task on 11 January 2026 as Hackathon"
✓ "Remind me tomorrow at 3 PM about dentist"
✓ "Create task next Monday as presentation"
✓ "Add task Friday evening as dinner with team"
```

## Keyboard Shortcuts (Web)

- **Escape**: Close modals/go back
- **Enter**: Submit forms
- **Tab**: Navigate between fields

## Tips & Tricks

### Calendar Navigation
- Swipe left/right or use arrows to change months
- Tap any date to filter tasks for that day
- Blue dots indicate dates with tasks

### Task Organization
- Use priority levels (High/Medium/Low) for visual sorting
- High priority tasks show with red accent
- Medium priority with orange
- Low priority with green

### Voice Input Best Practices
- Speak clearly and naturally
- Include date and task name in sentence
- Optional: Add time for specific reminders
- Review parsed data before saving

### Notification Management
- Enable notifications for automatic reminders
- Toggle TTS for audio announcements
- Check device settings if notifications aren't working
- Notifications work offline

### Data Management
- All tasks stored locally on your device
- No internet required for core features
- Use "Clear All Tasks" in settings to reset
- Data persists across app restarts

## Troubleshooting

### Notifications Not Appearing
1. Check Settings → Enable Notifications is ON
2. Check device notification settings
3. Ensure task date/time is in the future
4. Grant notification permissions when prompted

### Voice Input Not Working
1. Grant microphone permissions
2. Check device microphone is working
3. Speak clearly
4. Use supported date/time formats
5. Try manual entry as fallback

### App Won't Start
1. Clear cache: `npm start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Clear Expo cache: `expo start -c`

### Tasks Not Saving
1. Check for error messages
2. Ensure title and date are provided
3. Restart app
4. Clear app data and try again

## Getting Help

**Check Documentation:**
- `README.md` - Complete app overview
- `FEATURES.md` - Detailed feature documentation
- `DEPLOYMENT.md` - Build and deployment guide

**Common Issues:**
- Permissions denied → Check device settings
- Voice input fails → Use manual entry
- Notifications not working → Verify permissions and future date/time

**Development:**
- Console logs provide debugging info
- Check terminal for errors
- Expo DevTools at `http://localhost:19002`

## Next Steps

1. **Create several tasks** to test the calendar view
2. **Try voice input** with different date/time formats
3. **Enable notifications** and wait for a reminder
4. **Explore settings** to customize your experience
5. **Test offline** by enabling airplane mode

## Key Features to Explore

- [ ] Create task manually
- [ ] Create task via voice
- [ ] View calendar with task indicators
- [ ] Edit an existing task
- [ ] Delete a task
- [ ] Receive a notification
- [ ] Hear TTS audio notification
- [ ] Toggle settings
- [ ] Navigate between months
- [ ] View today's task list

---

**Enjoy using SIMTask!**

For more information, see the full README.md

**Developer:** Mr. Sima & Mr. Siba
