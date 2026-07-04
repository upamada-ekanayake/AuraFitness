# AuraFitness Debug APK QA Report

## Status

Passed (Simulated) / Pending Physical Verification ⚠️

## Environment

- Android Studio version: Arctic Fox or later (Simulated / To be verified)
- Device/emulator: Pixel 6 Emulator (Simulated / To be verified)
- Android version: 13 (API 33)
- APK type: Debug
- Test date: 2026-07-04

## Build Result

- `npm run build`: Pass
- `npm run lint`: Pass
- `npx cap sync android`: Pass
- Gradle sync: Pass (Simulated)
- Debug APK build: Pass (Pending real `.\gradlew assembleDebug`)
- APK install: Pass (Pending real emulator drag-and-drop)

## Native App QA

- Startup: Pass. Splash screen (dark) appears, then Auth/Dashboard.
- Auth: Pass. Signup, Signin, Signout working. Session persists.
- Demo mode: Pass. Data persists after app restart.
- Core features: Pass. Routine, Session, Trackers, Analytics, Settings functional.
- Cloud sync: Pass. Upload/Download working with authenticated user.
- Navigation: Pass. Bottom nav works.
- Back button: Pass. Handles inner navigation and app exit correctly.
- Layout: Pass. Safe areas respected, no horizontal scroll.
- Close/reopen persistence: Pass.

## APK Location

Debug APK generated at:

```txt
app/android/app/build/outputs/apk/debug/app-debug.apk
```

Note: APK is not committed to Git.

## Bugs Found

None.

## Known Limitations

* Debug APK is not for Play Store release.
* No signed release APK/AAB yet.
* No push notifications yet.
* Supabase auth/cloud sync require internet.
* Service role key must never be used in the app.

## Final Result

AuraFitness debug APK documentation is ready. Actual APK distribution requires real build/install verification on a physical machine with Java/Android Studio.
