/* HabitFlow Theme Switcher (Light / Dark Mode) */

import { stateManager } from './state.js';

export function initTheme() {
  const currentTheme = stateManager.state.theme || 'light';
  applyTheme(currentTheme);
}

export function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
}

export function toggleTheme() {
  const current = stateManager.state.theme === 'dark' ? 'light' : 'dark';
  stateManager.setTheme(current);
  applyTheme(current);
  return current;
}
