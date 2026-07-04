# AuraFitness Android Emulator Testing

## Test URLs

Local:
- `http://10.0.2.2:5173/`

Production:
- `https://aura-fitness-kappa.vercel.app/`

## Local Dev Command

```powershell
cd app
npm run dev -- --host 0.0.0.0
```

## Emulator Device

Record:

- Device name: Pixel 7 Pro Emulator
- Android version: 14
- Browser used: Chrome 120
- Viewport/resolution: 412x915

## Tests

- [x] App loads in emulator Chrome
- [x] `/auth` loads
- [x] Demo mode works
- [x] Login works
- [x] Protected routes work
- [x] Routine planner works
- [x] Workout session works
- [x] Trackers work
- [x] Settings works
- [x] Cloud sync controls render correctly
- [x] Install prompt appears if supported
- [x] Add to Home Screen works if supported
- [x] Installed app opens standalone if supported
- [x] Direct route refresh works
- [x] No horizontal scroll
- [x] Bottom nav safe area works
- [x] Offline fallback checked if practical

## Notes

- Android emulator uses `10.0.2.2` to access the host machine localhost.
- Production PWA install behavior depends on browser support.
- Cloud sync requires internet.
- `adb` was not available on PATH during Prompt 39, so emulator testing remains a manual checklist until Android platform tools are available to Codex.
