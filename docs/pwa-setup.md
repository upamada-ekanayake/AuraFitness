# AuraFitness PWA Setup

## Status

AuraFitness has installable PWA support.

## Features

- Web app manifest
- App icons
- Theme color
- Standalone display mode
- Basic service worker
- Basic offline fallback asset
- Install prompt support where available

## Limitations

- Cloud sync requires internet.
- Supabase auth requires internet.
- Offline data editing is still LocalStorage-based only.
- No background sync yet.
- No native Android wrapper yet.

## Install Instructions

### Android Chrome

1. Open AuraFitness in Chrome.
2. Tap the browser menu.
3. Tap Install app or Add to Home screen.
4. Open AuraFitness from the home screen.

### iPhone Safari

1. Open AuraFitness in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Open AuraFitness from the home screen.

## Testing

Production URL:
`https://aura-fitness-kappa.vercel.app/`

Local emulator URL:
`http://10.0.2.2:5173/`

## Implementation Notes

- Vite uses `vite-plugin-pwa` with `registerType: autoUpdate`.
- The app shell is used as the service worker navigation fallback so direct routes keep working.
- `offline.html` is included as a simple offline information page and cached asset.
- Supabase URLs are configured as network-only so auth and cloud sync are not served from stale cache.
