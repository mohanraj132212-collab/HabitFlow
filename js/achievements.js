/* HabitFlow Achievements View Controller (No Streak Achievements) */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { calculateOverallStats, calculateHabitStats } from './date-utils.js';

export function renderAchievementsView(container) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const stats = calculateOverallStats(habits, habitLogs, year, month);

  let completedGoalsCount = 0;
  habits.forEach(h => {
    const s = calculateHabitStats(h, habitLogs, year, month);
    if (s.completedDays >= (h.monthlyGoal || 20)) completedGoalsCount++;
  });

  const achievementsList = [
    { key: 'first_habit_added', title: 'First Habit Added', desc: 'Add your first habit to track', icon: 'star', unlocked: habits.length >= 1 },
    { key: 'first_completed', title: 'First Execution', desc: 'Complete your first daily habit', icon: 'check', unlocked: stats.monthlyCompleted >= 1 },
    { key: 'first_goal', title: 'First Goal Reached', desc: 'Achieve a monthly target goal', icon: 'goals', unlocked: completedGoalsCount >= 1 },
    { key: 'completions_10', title: '10 Executions', desc: 'Reach 10 total habit completions', icon: 'check', unlocked: stats.monthlyCompleted >= 10 },
    { key: 'completions_50', title: '50 Executions', desc: 'Reach 50 total habit completions', icon: 'star', unlocked: stats.monthlyCompleted >= 50 },
    { key: 'completions_100', title: 'Century Club', desc: 'Reach 100 total habit completions', icon: 'achievements', unlocked: stats.monthlyCompleted >= 100 },
    { key: 'monthly_90', title: 'Consistency King', desc: 'Achieve 90% monthly completion rate', icon: 'analytics', unlocked: stats.monthlyPercentage >= 90 },
    { key: 'perfect_day', title: 'Perfect Day', desc: 'Complete 100% of today\'s habits', icon: 'sun', unlocked: stats.todayPercentage === 100 && stats.todayTotal > 0 }
  ];

  const unlockedCount = achievementsList.filter(a => a.unlocked).length;

  const html = `
    <div class="section-fade-in">
      <div class="habits-toolbar">
        <div>
          <h2>Trophies & Achievements</h2>
          <p>Unlock badges by building consistent habit routines and completing monthly goals.</p>
        </div>
        <span class="badge badge-pink" style="font-size:0.9rem; padding:0.4rem 0.8rem;">
          ${unlockedCount} of ${achievementsList.length} Badges Unlocked 🏆
        </span>
      </div>

      <div class="achievements-grid">
        ${achievementsList.map(a => `
          <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
            <div class="achievement-icon-wrapper">
              ${renderIcon(a.unlocked ? a.icon : 'lock')}
            </div>

            <div class="achievement-info">
              <div class="achievement-title">${a.title}</div>
              <div class="achievement-desc">${a.desc}</div>
              <div class="achievement-badge-status">
                <span class="badge ${a.unlocked ? 'badge-success' : 'badge-pink'}">
                  ${a.unlocked ? 'Unlocked ✓' : 'Locked 🔒'}
                </span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
}
