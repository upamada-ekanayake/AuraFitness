import { LayoutDashboard, Play, Droplets, Flame, Menu } from 'lucide-react';

export const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, mobile: true },
  { path: '/workout', label: 'Workout', icon: Play, mobile: true },
  { path: '/water', label: 'Water', icon: Droplets, mobile: true },
  { path: '/calories', label: 'Calories', icon: Flame, mobile: true },
  { path: '/more', label: 'More', icon: Menu, mobile: true },
];
