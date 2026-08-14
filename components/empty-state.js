/* HabitFlow Reusable Empty State Component */

import { renderIcon } from './svg-icons.js';

export function createEmptyStateHTML(title, description, actionText = 'Explore Habit Library', actionRoute = 'habit-library', iconName = 'star') {
  return `
    <div class="card" style="text-align:center; padding:3.5rem 1.5rem; margin:1rem 0;">
      <div style="width:64px; height:64px; border-radius:50%; background:var(--primary-pink-light); color:var(--primary-pink); display:inline-flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:1rem;">
        ${renderIcon(iconName)}
      </div>
      <h3 style="font-size:1.3rem; margin-bottom:0.4rem;">${title}</h3>
      <p style="max-width:420px; margin:0 auto 1.5rem auto; color:var(--text-muted);">${description}</p>
      ${actionText ? `
        <button class="btn btn-primary" data-route="${actionRoute}">
          ${renderIcon('plus')} ${actionText}
        </button>
      ` : ''}
    </div>
  `;
}
