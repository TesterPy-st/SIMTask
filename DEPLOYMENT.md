# SIMTask Deployment Guide

This guide provides instructions for building and deploying the SIMTask application to various platforms.

## Prerequisites

- Node.js 16+ and npm
- Expo CLI: `npm install -g expo-cli`
- Platform-specific requirements:
  - **Android**: Android Studio with Android SDK
  - **iOS**: Xcode (macOS only) and Apple Developer account
  - **Web**: None (runs in browser)

## Development

### Start Development Server
```bash
npm start
```

This will start the Expo development server. You can then:
- Press `a` to open on Android device/emulator
- Press `i` to open on iOS simulator (macOS only)
- Press `w` to open in web browser
- Scan QR code with Expo Go app on physical device

### Platform-Specific Development

**Android**
```bash
npm run android
```

**iOS** (macOS only)
```bash
npm run ios
```

**Web**
```bash
npm run web
```

## Production Builds

### Using EAS Build (Recommended)

1. **Install EAS CLI**
```bash
npm install -g eas-cli
```

2. **Login to Expo**
```bash
eas login
```

3. **Configure EAS**
```bash
eas build:configure
```

4. **Build for Android**
```bash
# APK for testing
eas build --platform android --profile preview

# AAB for Google Play Store
eas build --platform android --profile production
```

5. **Build for iOS**
```bash
# Development build
eas build --platform ios --profile development

# App Store build
eas build --platform ios --profile production
```

### Using Classic Expo Build

**Android APK**
```bash
expo build:android -t apk
```

**Android App Bundle (for Play Store)**
```bash
expo build:android -t app-bundle
```

**iOS** (requires Apple Developer account)
```bash
expo build:ios
```

## Configuration for Production

### Android Configuration

1. **Update app.json**
   - Set correct `android.package` (e.g., `com.yourcompany.simtask`)
   - Configure `versionCode` and version
   - Set proper icon and splash screen

2. **Generate Keystore** (for signing)
```bash
keytool -genkey -v -keystore simtask-release.keystore -alias simtask -keyalg RSA -keysize 2048 -validity 10000
```

3. **Configure Credentials**
   - Use EAS to manage credentials automatically
   - Or manually configure in `credentials.json`

### iOS Configuration

1. **Update app.json**
   - Set correct `ios.bundleIdentifier`
   - Configure version and build number
   - Set proper icons

2. **Apple Developer Setup**
   - Create App ID in Apple Developer Portal
   - Generate provisioning profiles
   - Configure push notification capabilities

### Environment Variables

Create `.env` file for sensitive configuration (not committed to git):
```
API_URL=https://your-api-url.com
```

## App Store Submission

### Google Play Store

1. Build AAB (Android App Bundle)
2. Create app listing in Google Play Console
3. Upload AAB and fill in store listing details
4. Submit for review

**Required Assets:**
- High-res icon (512x512)
- Feature graphic (1024x500)
- Screenshots for phone and tablet
- Privacy policy URL

### Apple App Store

1. Build with EAS or Xcode
2. Create app in App Store Connect
3. Upload build using Transporter or EAS Submit
4. Fill in app metadata
5. Submit for review

**Required Assets:**
- App icon (1024x1024)
- Screenshots for various device sizes
- Privacy policy URL
- App description and keywords

## Web Deployment

### Build for Web
```bash
expo export:web
```

Output will be in `web-build/` directory.

### Hosting Options

**Netlify**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir web-build
```

**Vercel**
```bash
npm install -g vercel
vercel --prod web-build
```

**Firebase Hosting**
```bash
npm install -g firebase-tools
firebase deploy
```

## Platform-Specific Notes

### Android
- Minimum SDK version: 21 (Android 5.0)
- Target SDK: Latest stable
- Required permissions are auto-configured in app.json
- Test on multiple device sizes and Android versions

### iOS
- Minimum iOS version: 13.0
- Test on iPhone and iPad
- Ensure proper handling of safe areas
- Test notification permissions flow

### Web
- Responsive design tested on desktop and mobile browsers
- Some native features (notifications, voice) may have limited support
- Consider Progressive Web App (PWA) features

## Testing Before Release

### Functional Testing
- [ ] Create, edit, delete tasks
- [ ] Voice input parsing
- [ ] Calendar navigation
- [ ] Notifications trigger correctly
- [ ] TTS plays audio
- [ ] Settings persist
- [ ] Offline functionality

### Device Testing
- [ ] Test on low-end devices
- [ ] Test on tablets
- [ ] Test different screen sizes
- [ ] Test different OS versions

### Performance Testing
- [ ] App launches in < 2 seconds
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Battery usage acceptable

## Monitoring & Analytics

Consider adding:
- Crash reporting (Sentry, Bugsnag)
- Analytics (Firebase Analytics, Amplitude)
- Performance monitoring
- User feedback system

## Version Management

Update version in:
1. `app.json` → `version`
2. `app.json` → `android.versionCode`
3. `app.json` → `ios.buildNumber`

Follow semantic versioning: MAJOR.MINOR.PATCH

## Troubleshooting

**Build fails on Android**
- Clear cache: `expo start -c`
- Check Java version
- Verify Android SDK installation

**Build fails on iOS**
- Check Xcode version
- Verify provisioning profiles
- Clear derived data

**Notifications not working**
- Verify permissions in app.json
- Check device notification settings
- Test on physical device (not simulator)

## Support & Resources

- Expo Documentation: https://docs.expo.dev
- React Native Documentation: https://reactnative.dev
- Expo Forums: https://forums.expo.dev
- Stack Overflow: Tag with `expo` and `react-native`

---

**Developed by:** Mr. Sima & Mr. Siba
