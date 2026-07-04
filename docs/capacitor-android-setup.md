# AuraFitness Capacitor Android Setup

## Status

AuraFitness has a Capacitor Android wrapper.

## App Identity

- App name: AuraFitness
- App ID: `com.upamada.aurafitness`
- Web directory: `dist`

## Commands

```powershell
cd app
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/app @capacitor/status-bar @capacitor/splash-screen
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

## Development Workflow

After changing React code:

```powershell
cd app
npm run build
npx cap sync android
npx cap open android
```

Then run from Android Studio.

## Building Debug APK

To build a debug APK from the terminal:

```powershell
cd app/android
.\gradlew assembleDebug
```

The APK will be located at:
`app/android/app/build/outputs/apk/debug/app-debug.apk`

## Environment Variables

Native build uses Vite env variables at build time.

Required local file:

```txt
app/.env
```

Required values:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Do not commit `.env`.

Never use the Supabase service role key in the frontend.

## Limitations

* This is a native wrapper, not a fully custom native app.
* Supabase auth/cloud sync require internet.
* Push notifications are not added yet.
* Play Store signed release is not done yet.
* No deep links/social login yet.
