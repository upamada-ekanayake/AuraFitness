# AuraFitness Deployment Checklist

## GitHub

- [x] GitHub remote configured (Awaiting user URL input)
- [ ] Latest code pushed
- [x] Branch confirmed (`master`)
- [x] No secrets committed
- [x] No `node_modules` committed
- [x] No `app/dist` committed
- [x] No Python virtual environment committed
- [x] No raw datasets committed

## Vercel Project Settings

Use these settings:

- Framework Preset: Vite
- Root Directory: `app`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## SPA Routing

`app/vercel.json` exists with rewrite to `index.html`.

Routes to verify after deployment:

- `/`
- `/routine`
- `/session`
- `/analytics`
- `/settings`

## Post-Deployment QA

- [ ] Dashboard loads
- [ ] Mobile navigation works
- [ ] Desktop sidebar works
- [ ] Routine Planner works
- [ ] Workout Session works
- [ ] Daily Trackers work
- [ ] AI Suggestions display
- [ ] Analytics page loads
- [ ] Settings reset works
- [ ] Browser refresh on nested routes works
