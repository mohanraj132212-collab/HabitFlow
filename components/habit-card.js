/* HabitFlow Habit Card Component (No Streak System, Start-Date Aware) */

import { renderIcon } from './svg-icons.js';
import { isDateEligible } from '../js/date-utils.js';

export function createHabitCard(habit, isTodayCompleted = false) {
  const color = habit.color || '#FF4F9A';
  const todayStr = new Date().toISOString().split('T')[0];
  const isTodayEligible = isDateEligible(todayStr, habit.startDate);

  return `
    <div class="habit-card" data-id="${habit.id}">
      <div class="habit-card-accent-strip" style="background-color: ${color}"></div>
      
      <div class="habit-card-top">
        <div class="habit-card-info">
          <span class="habit-card-title">${habit.name}</span>
          <span class="habit-card-desc">${habit.description || 'No description added'}</span>
        </div>
        <span class="badge habit-card-badge" style="background-color: ${color}20; color: ${color}">
          ${habit.category || 'General'}
        </span>
      </div>

      <div class="habit-card-metrics">
        <div class="habit-card-metric-item">
          <span class="habit-card-metric-val">${habit.completedDays || 0}/${habit.monthlyGoal || 20}d</span>
          <span class="habit-card-metric-lbl">Target</span>
        </div>
        <div class="habit-card-metric-item">
          <span class="habit-card-metric-val">${habit.completionRate || 0}%</span>
          <span class="habit-card-metric-lbl">Completion</span>
        </div>
        <div class="habit-card-metric-item">
          <span class="habit-card-metric-val" style="font-size:0.775rem;">${habit.startDate || 'Today'}</span>
          <span class="habit-card-metric-lbl">Start Date</span>
        </div>
      </div>

      <div class="habit-card-actions">
        <button class="btn habit-toggle-btn ${isTodayCompleted ? 'completed' : ''}" 
                data-action="toggle-today" 
                data-habit-id="${habit.id}" 
                ${!isTodayEligible ? 'disabled title="Habit starts in the future"' : 'title="Toggle Completion Today"'}>
          ${renderIcon('check')}
        </button>

        <div style="display:flex; gap:0.4rem;">
          <button class="btn-icon" data-action="delete-habit" data-habit-id="${habit.id}" title="Delete Habit">
            ${renderIcon('trash')}
          </button>
        </div>
      </div>
    </div>
  `;
}
