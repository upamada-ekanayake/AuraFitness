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

- Device name:
- Android version:
- Browser used:
- Viewport/resolution:

## Tests

- [ ] App loads in emulator Chrome
- [ ] `/auth` loads
- [ ] Demo mode works
- [ ] Login works
- [ ] Protected routes work
- [ ] Routine planner works
- [ ] Workout session works
- [ ] Trackers work
- [ ] Settings works
- [ ] Cloud sync controls render correctly
- [ ] Install prompt appears if supported
- [ ] Add to Home Screen works if supported
- [ ] Installed app opens standalone if supported
- [ ] Direct route refresh works
- [ ] No horizontal scroll
- [ ] Bottom nav safe area works
- [ ] Offline fallback checked if practical

## Notes

- Android emulator uses `10.0.2.2` to access the host machine localhost.
- Production PWA install behavior depends on browser support.
- Cloud sync requires internet.
- `adb` was not available on PATH during Prompt 39, so emulator testing remains a manual checklist until Android platform tools are available to Codex.
