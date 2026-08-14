/* HabitFlow Sidebar Component with official Logo */

import { renderIcon } from './svg-icons.js';

export function createSidebar(activeRoute = 'dashboard') {
  const navItems = [
    { route: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { route: 'habits', label: 'My Habits', icon: 'habits' },
    { route: 'habit-library', label: 'Habit Library', icon: 'star' },
    { route: 'calendar', label: 'Calendar', icon: 'calendar' },
    { route: 'analytics', label: 'Analytics', icon: 'analytics' },
    { route: 'goals', label: 'Goals', icon: 'goals' },
    { route: 'journal', label: 'Journal', icon: 'journal' },
    { route: 'achievements', label: 'Achievements', icon: 'achievements' },
    { route: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return `
    <aside class="sidebar" id="appSidebar">
      <div class="sidebar-logo">
        <img src="assets/logo/logo.png" alt="HabitFlow Logo" style="width:36px; height:36px; border-radius:8px; box-shadow:var(--shadow-pink);" />
        <div class="sidebar-logo-text">Habit<span>Flow</span></div>
      </div>
      
      <nav class="sidebar-nav">
        ${navItems.map(item => `
          <a class="nav-item ${item.route === activeRoute ? 'active' : ''}" data-route="${item.route}">
            <span class="nav-icon">${renderIcon(item.icon)}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <small>HabitFlow Cloud</small>
        <span class="badge badge-pink">Sync Active</span>
      </div>
    </aside>
  `;
}
