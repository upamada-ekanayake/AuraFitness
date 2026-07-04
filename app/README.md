# AuraFitness App

AuraFitness is a mobile-first fitness tracking MVP built with React, TypeScript, Vite, Tailwind CSS, and LocalStorage.

## Features

- Weekly routine planner
- Workout session tracking
- Water tracker
- Calorie tracker
- Body weight tracker
- Fasting tracker
- Rule-based AI suggestion cards
- Streak and habit score dashboard
- Progress analytics and history
- LocalStorage persistence

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- LocalStorage

## Local Development

```powershell
npm install
npm run dev
```

## Build

```powershell
npm run build
```

## Preview Production Build

```powershell
npm run preview
```

## Android Emulator Testing

If testing from an Android Studio emulator while the Vite server runs on the PC:

```txt
http://10.0.2.2:5173
```

## Data Storage

This MVP stores data in browser LocalStorage.

No backend is used yet.

## AI Status

The app currently uses rule-based AI-style suggestions.

No ML model is running in the React app.

No LLM API is called.

## Deployment Notes

For Vercel:

* Project root: `app`
* Build command: `npm run build`
* Output directory: `dist`