/* HabitFlow Dashboard View Controller (Personalized User Greeting) */

import { stateManager } from './state.js';
import { calculateOverallStats } from './date-utils.js';
import { renderIcon } from '../components/svg-icons.js';
import { createProgressCard } from '../components/progress-card.js';
import { createSpreadsheetHabitGrid } from '../components/habit-grid.js';
import { createEmptyStateHTML } from '../components/empty-state.js';

export function renderDashboardView(container) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const user = stateManager.currentUser || { name: 'User' };
  const displayName = user.name || 'User';
  const stats = calculateOverallStats(habits, habitLogs, year, month);

  // Empty state if user has no habits created yet
  if (!habits || habits.length === 0) {
    container.innerHTML = `
      <div class="section-fade-in">
        <div class="dashboard-hero">
          <div class="dashboard-greeting">
            <h1>Welcome, ${displayName} 👋</h1>
            <p>Your journey starts today 🌸 Explore the Habit Library to add your daily habits.</p>
          </div>
        </div>

        <div class="stats-grid">
          ${createProgressCard("Today's Progress", `0%`, `0 of 0 habits`, 'check', 'pink')}
          ${createProgressCard("Monthly Completion", `0%`, `0 total completions`, 'calendar', 'success')}
          ${createProgressCard("Active Habits", `0`, `Add from Habit Library`, 'star', 'warning')}
          ${createProgressCard("Productivity Rating", `0 / 100`, "Based on consistency", 'analytics', 'info')}
        </div>

        ${createEmptyStateHTML(
          'Your Habit Flow is Empty',
          'Explore our master 99+ Habit Library or create custom habits to start tracking your daily progress.',
          'Explore 99+ Habit Library',
          'habit-library',
          'star'
        )}
      </div>
    `;
    return;
  }

  // Active habits UI
  const html = `
    <div class="section-fade-in">
      <div class="dashboard-hero">
        <div class="dashboard-greeting">
          <h1>Welcome, ${displayName} 👋</h1>
          <p>Here is your daily habit performance and consistency overview.</p>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-outline" data-route="habit-library">
            ${renderIcon('star')} Habit Library
          </button>
          <button class="btn btn-primary" id="dashAddHabitBtn">
            ${renderIcon('plus')} Custom Habit
          </button>
        </div>
      </div>

      <div class="stats-grid">
        ${createProgressCard("Today's Progress", `${stats.todayPercentage}%`, `${stats.todayCompleted} of ${stats.todayTotal} habits done`, 'check', 'pink')}
        ${createProgressCard("Monthly Completion", `${stats.monthlyPercentage}%`, `${stats.monthlyCompleted} total completions`, 'calendar', 'success')}
        ${createProgressCard("Active Habits", `${stats.totalHabits}`, `In tracking roster`, 'star', 'warning')}
        ${createProgressCard("Productivity Score", `${stats.productivityScore}/100`, "Based on consistency & goals", 'analytics', 'info')}
      </div>

      <div class="dashboard-main-grid">
        <div class="card today-habits-card">
          <div class="card-header">
            <h3>Today's Habit Checklist</h3>
            <span class="badge badge-pink">${stats.todayCompleted}/${stats.todayTotal} Done</span>
          </div>

          <div class="habits-checklist-list">
            ${habits.map(h => {
              const isDone = habitLogs[h.id] && habitLogs[h.id][todayStr];
              return `
                <div class="habit-checklist-item">
                  <div class="habit-checklist-left">
                    <span class="habit-checklist-color" style="background-color:${h.color || '#FF4F9A'}"></span>
                    <div>
                      <span class="habit-checklist-name">${h.name}</span>
                      <span class="habit-checklist-category">${h.category}</span>
                    </div>
                  </div>
                  <button class="habit-toggle-btn ${isDone ? 'completed' : ''}"
                          data-action="toggle-today"
                          data-habit-id="${h.id}"
                          title="Toggle Completion">
                    ${renderIcon('check')}
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Habit Overview</h3>
          </div>
          <div class="activity-timeline">
            ${habits.slice(0, 5).map(h => {
              const isDone = habitLogs[h.id] && habitLogs[h.id][todayStr];
              return `
                <div class="activity-item">
                  <div class="activity-dot" style="background-color:${isDone ? 'var(--success)' : 'var(--border-color)'}"></div>
                  <div class="activity-content">
                    <div class="activity-title">${h.name}</div>
                    <div class="activity-time">Started ${h.startDate || 'Recently'}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Quick Embedded Habit Grid -->
      ${createSpreadsheetHabitGrid(habits, year, month, habitLogs)}
    </div>
  `;

  container.innerHTML = html;
}
