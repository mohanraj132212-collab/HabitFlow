/* HabitFlow Analytics View Controller (No Streak Analytics, Start-Date Sensitive) */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { calculateOverallStats, calculateHabitStats, isDateEligible } from './date-utils.js';
import { createEmptyStateHTML } from '../components/empty-state.js';

export function renderAnalyticsView(container) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (!habits || habits.length === 0) {
    container.innerHTML = `
      <div class="section-fade-in">
        <div style="margin-bottom:1.5rem;">
          <h2>Analytics & Performance</h2>
          <p>In-depth statistics and consistency metrics.</p>
        </div>
        ${createEmptyStateHTML(
          'No Data Available',
          'Add habits to start generating performance analytics and daily consistency charts.',
          'Explore Habit Library',
          'habit-library',
          'analytics'
        )}
      </div>
    `;
    return;
  }

  const stats = calculateOverallStats(habits, habitLogs, year, month);

  // Calculate habit-wise performance ranking based on eligible days
  const habitRankings = habits.map(h => {
    const habitStats = calculateHabitStats(h, habitLogs, year, month);
    return { name: h.name, done: habitStats.completedDays, rate: habitStats.completionRate, color: h.color };
  }).sort((a, b) => b.rate - a.rate);

  const topHabits = habitRankings.slice(0, 4);
  const bottomHabits = [...habitRankings].reverse().slice(0, 4);

  // Last 7 days consistency percentages
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    let done = 0;
    let totalEligible = 0;

    habits.forEach(h => {
      if (isDateEligible(dateStr, h.startDate)) {
        totalEligible++;
        if (habitLogs[h.id] && habitLogs[h.id][dateStr]) done++;
      }
    });

    const pct = totalEligible > 0 ? Math.round((done / totalEligible) * 100) : 0;
    last7Days.push({
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      pct
    });
  }

  const html = `
    <div class="section-fade-in">
      <div style="margin-bottom:1.5rem;">
        <h2>Analytics & Performance</h2>
        <p>In-depth statistics, consistency metrics, and goal achievements.</p>
      </div>

      <div class="analytics-overview-grid">
        <div class="card">
          <div class="stat-label">Productivity Rating</div>
          <div class="stat-value" style="color:var(--primary-pink);">${stats.productivityScore} / 100</div>
          <div class="stat-subtext">Calculated from habit completion rates</div>
        </div>

        <div class="card">
          <div class="stat-label">Monthly Completion Rate</div>
          <div class="stat-value">${stats.monthlyPercentage}%</div>
          <div class="stat-subtext">${stats.monthlyCompleted} total executions this month</div>
        </div>

        <div class="card">
          <div class="stat-label">Active Habits Tracked</div>
          <div class="stat-value" style="color:var(--success);">${stats.totalHabits} Habits</div>
          <div class="stat-subtext">In your tracking roster</div>
        </div>
      </div>

      <!-- Weekly Consistency Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>Last 7 Days Consistency</h3>
          <span class="badge badge-pink">Daily Performance</span>
        </div>

        <div class="chart-container">
          ${last7Days.map(item => `
            <div class="chart-bar-col">
              <div class="chart-bar-fill" style="height: ${Math.max(8, item.pct)}%;" title="${item.dayLabel}: ${item.pct}%"></div>
              <span class="chart-bar-label">${item.dayLabel}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Rankings Grid -->
      <div class="analytics-rankings-grid">
        <div class="card">
          <div class="card-header">
            <h3>🏆 Top Performing Habits</h3>
          </div>
          ${topHabits.map((item, idx) => `
            <div class="ranking-item">
              <div class="ranking-left">
                <span class="ranking-index">#${idx + 1}</span>
                <span class="ranking-name">${item.name}</span>
              </div>
              <span class="ranking-val" style="color:var(--success);">${item.rate}%</span>
            </div>
          `).join('')}
        </div>

        <div class="card">
          <div class="card-header">
            <h3>🎯 Focus Opportunities</h3>
          </div>
          ${bottomHabits.map((item, idx) => `
            <div class="ranking-item">
              <div class="ranking-left">
                <span class="ranking-index">#${idx + 1}</span>
                <span class="ranking-name">${item.name}</span>
              </div>
              <span class="ranking-val" style="color:var(--warning);">${item.rate}%</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}
