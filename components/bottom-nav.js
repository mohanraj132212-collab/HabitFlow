/* HabitFlow Mobile Bottom Navigation Component */

import { renderIcon } from './svg-icons.js';

export function createBottomNav(activeRoute = 'dashboard') {
  const items = [
    { route: 'dashboard', label: 'Home', icon: 'dashboard' },
    { route: 'habits', label: 'Habits', icon: 'habits' },
    { route: 'habit-library', label: 'Library', icon: 'star' },
    { route: 'analytics', label: 'Stats', icon: 'analytics' },
    { route: 'settings', label: 'Settings', icon: 'settings' }
  ];

  return `
    <nav class="bottom-nav">
      ${items.map(item => `
        <a class="bottom-nav-item ${item.route === activeRoute ? 'active' : ''}" data-route="${item.route}">
          <span class="bottom-nav-icon">${renderIcon(item.icon)}</span>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
  `;
}
