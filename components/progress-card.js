/* HabitFlow Progress Card Component */

import { renderIcon } from './svg-icons.js';

export function createProgressCard(title, valStr, subtext, iconName = 'flame', colorVariant = 'pink') {
  return `
    <div class="stat-card">
      <div class="stat-icon stat-icon-${colorVariant}">
        ${renderIcon(iconName)}
      </div>
      <div class="stat-info">
        <div class="stat-label">${title}</div>
        <div class="stat-value">${valStr}</div>
        <div class="stat-subtext">${subtext}</div>
      </div>
    </div>
  `;
}
