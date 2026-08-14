/* HabitFlow Habit Management View Controller (Start-Date Aware) */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { createHabitCard } from '../components/habit-card.js';
import { calculateHabitStats } from './date-utils.js';
import { createEmptyStateHTML } from '../components/empty-state.js';

export function renderHabitsView(container) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const categories = Array.from(new Set(habits.map(h => h.category || 'General')));

  if (!habits || habits.length === 0) {
    container.innerHTML = `
      <div class="section-fade-in">
        <div class="habits-toolbar">
          <div>
            <h2>My Daily Habits (0)</h2>
            <p>Manage your habits, target goals, and categories.</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-outline" data-route="habit-library">${renderIcon('star')} Browse 99+ Library</button>
            <button class="btn btn-primary" id="openAddHabitModalBtn">${renderIcon('plus')} Custom Habit</button>
          </div>
        </div>

        ${createEmptyStateHTML(
          'No Habits Added Yet',
          'Choose habits from our master 99+ Habit Library or create custom habits to begin daily tracking.',
          'Explore Habit Library',
          'habit-library',
          'star'
        )}
      </div>
    `;
    return;
  }

  const html = `
    <div class="section-fade-in">
      <div class="habits-toolbar">
        <div>
          <h2>My Daily Habits (${habits.length})</h2>
          <p>Manage your habits, start dates, target goals, and categories.</p>
        </div>

        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-outline" data-route="habit-library">${renderIcon('star')} 99+ Habit Library</button>
          <button class="btn btn-primary" id="openAddHabitModalBtn">${renderIcon('plus')} Custom Habit</button>
        </div>
      </div>

      <div class="habits-toolbar">
        <div class="habits-search-filter">
          <div class="search-input-wrapper">
            <span class="search-icon-inside">${renderIcon('search')}</span>
            <input type="text" class="form-control" id="habitSearchInput" placeholder="Search my habits..." />
          </div>

          <select class="form-control category-filter-select" id="habitCategoryFilter">
            <option value="all">All Categories</option>
            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="habits-grid-list" id="habitsGridList">
        ${habits.map(h => {
          const logs = habitLogs[h.id] || {};
          const isTodayDone = !!logs[todayStr];
          const stats = calculateHabitStats(h, habitLogs, year, month);

          const habitObj = {
            ...h,
            completedDays: stats.completedDays,
            completionRate: stats.completionRate
          };

          return createHabitCard(habitObj, isTodayDone);
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
  bindHabitEvents(container);
}

function bindHabitEvents(container) {
  const searchInput = container.querySelector('#habitSearchInput');
  const categoryFilter = container.querySelector('#habitCategoryFilter');

  if (searchInput && categoryFilter) {
    const filterFn = () => {
      const query = searchInput.value.toLowerCase();
      const cat = categoryFilter.value;
      const cards = container.querySelectorAll('.habit-card');

      cards.forEach(card => {
        const title = card.querySelector('.habit-card-title').textContent.toLowerCase();
        const badge = card.querySelector('.habit-card-badge').textContent.trim();
        const matchesQuery = title.includes(query);
        const matchesCat = cat === 'all' || badge === cat;

        if (matchesQuery && matchesCat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    };

    searchInput.addEventListener('input', filterFn);
    categoryFilter.addEventListener('change', filterFn);
  }
}
