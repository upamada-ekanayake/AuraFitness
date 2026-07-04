import { LayoutDashboard, Calendar, Play, BarChart2, Settings } from 'lucide-react';

export const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/routine', label: 'Planner', icon: Calendar },
  { path: '/workout', label: 'Workout', icon: Play },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];
