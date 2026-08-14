/* HabitFlow Goals View Controller (Start-Date Sensitive) */

import { stateManager } from './state.js';
import { calculateHabitStats } from './date-utils.js';
import { createEmptyStateHTML } from '../components/empty-state.js';

export function renderGoalsView(container) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (!habits || habits.length === 0) {
    container.innerHTML = `
      <div class="section-fade-in">
        <div style="margin-bottom:1.5rem;">
          <h2>Monthly Target Goals</h2>
          <p>Track targets and achieve your monthly routine milestones.</p>
        </div>
        ${createEmptyStateHTML(
          'No Goals Set',
          'Add habits to set monthly targets and track goal milestones.',
          'Explore Habit Library',
          'habit-library',
          'goals'
        )}
      </div>
    `;
    return;
  }

  const goalsData = habits.map(h => {
    const stats = calculateHabitStats(h, habitLogs, year, month);
    const targetDays = h.monthlyGoal || 20;
    const progressPct = Math.min(100, Math.round((stats.completedDays / targetDays) * 100));
    const isCompleted = stats.completedDays >= targetDays;

    return {
      ...h,
      doneDays: stats.completedDays,
      targetDays,
      progressPct,
      isCompleted
    };
  });

  const completedGoalsCount = goalsData.filter(g => g.isCompleted).length;

  const html = `
    <div class="section-fade-in">
      <div class="habits-toolbar">
        <div>
          <h2>Monthly Target Goals</h2>
          <p>Track targets and achieve your monthly routine milestones.</p>
        </div>
        <span class="badge badge-pink" style="font-size:0.9rem; padding:0.4rem 0.8rem;">
          ${completedGoalsCount} of ${habits.length} Goals Achieved 🎯
        </span>
      </div>

      <div class="goals-grid">
        ${goalsData.map(g => `
          <div class="goal-card">
            <div>
              <div class="goal-header">
                <div class="goal-title-group">
                  <h3>${g.name}</h3>
                  <span class="goal-target-text">${g.category}</span>
                </div>
                <span class="badge ${g.isCompleted ? 'badge-success' : 'badge-pink'}">
                  ${g.isCompleted ? 'Goal Reached 🎉' : 'In Progress'}
                </span>
              </div>

              <div class="goal-progress-section">
                <div class="goal-stats-row">
                  <span>${g.doneDays} / ${g.targetDays} Days Target</span>
                  <span class="goal-percentage">${g.progressPct}%</span>
                </div>
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill" style="width: ${g.progressPct}%; background-color: ${g.color || '#FF4F9A'};"></div>
                </div>
              </div>
            </div>

            <small style="color:var(--text-light);">Start Date: ${g.startDate || 'Recently'}</small>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}
