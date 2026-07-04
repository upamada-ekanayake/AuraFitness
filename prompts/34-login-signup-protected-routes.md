# Prompt 34: Login Signup UI and Protected Routes

Goal:
Add Supabase login/signup UI, demo mode, user menu, and protected route flow.

Files created or edited:
- app/src/services/demoModeService.ts
- app/src/hooks/useDemoMode.ts
- app/src/components/auth/AuthForm.tsx
- app/src/components/auth/AuthGate.tsx
- app/src/components/auth/UserMenu.tsx
- app/src/pages/AuthPage.tsx
- app/src/App.tsx
- app/src/components/layout/AppShell.tsx
- app/src/components/navigation/SidebarNav.tsx
- app/src/components/navigation/MobileBottomNav.tsx
- app/src/pages/Settings.tsx
- docs/supabase-setup.md
- prompts/34-login-signup-protected-routes.md
- docs/prompt-history.md
- docs/testing-checklist.md

Result:
Users can sign in, sign up, sign out, or continue in demo mode.
App routes are protected by auth or demo mode.
Settings shows account/auth state.
Build and lint passed.

Rules:
- No backend added.
- No Python AI engine changes.
- No cloud sync connected yet.
- No secrets committed.

Next:
Build LocalStorage to Supabase cloud sync.
