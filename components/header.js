/* HabitFlow Header Component with Profile Image URL Support */

import { renderIcon } from './svg-icons.js';
import { stateManager } from '../js/state.js';

export function createHeader(title = 'Dashboard', currentTheme = 'light') {
  const isDark = currentTheme === 'dark';
  const user = stateManager.currentUser || { name: 'User', profileImageUrl: '' };
  const name = user.name || 'User';
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'HF';

  return `
    <header class="header">
      <div class="header-left">
        <h2 class="header-title">${title}</h2>
      </div>
      
      <div class="header-right">
        <button class="theme-toggle-btn" id="themeToggleBtn" title="Toggle Theme" aria-label="Toggle Theme">
          ${renderIcon(isDark ? 'sun' : 'moon')}
        </button>

        <div class="user-profile-btn" id="headerProfileBtn" data-route="settings">
          <div class="user-avatar" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">
            ${user.profileImageUrl ? `<img src="${user.profileImageUrl}" style="width:100%; height:100%; object-fit:cover;" alt="Avatar" />` : initials}
          </div>
          <span class="user-name">${name}</span>
        </div>
      </div>
    </header>
  `;
}
