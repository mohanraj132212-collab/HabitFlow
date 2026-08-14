/* HabitFlow Habit Library Card Component */

import { renderIcon } from './svg-icons.js';

export function createHabitLibraryCard(habitItem, isAlreadyAdded = false) {
  return `
    <div class="library-card" data-lib-id="${habitItem.id}">
      <div>
        <div class="library-card-header">
          <div class="library-card-icon">
            ${renderIcon(habitItem.icon || 'star')}
          </div>
          <div>
            <div class="library-card-title">${habitItem.name}</div>
            <span class="badge badge-pink">${habitItem.category}</span>
          </div>
        </div>

        <p class="library-card-desc">${habitItem.description}</p>
      </div>

      <div class="library-card-footer">
        <small style="color:var(--text-light);">Goal: ${habitItem.defaultGoal}d / mo</small>
        <button class="btn ${isAlreadyAdded ? 'btn-outline' : 'btn-primary'} btn-sm" 
                data-action="select-library-habit" 
                data-lib-id="${habitItem.id}"
                ${isAlreadyAdded ? 'disabled' : ''}>
          ${isAlreadyAdded ? 'Added ✓' : '+ Add Habit'}
        </button>
      </div>
    </div>
  `;
}
