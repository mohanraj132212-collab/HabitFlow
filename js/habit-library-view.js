/* HabitFlow 99+ Habit Library View Controller */

import { stateManager } from './state.js';
import { ADMIN_HABIT_LIBRARY } from './habit-library.js';
import { renderIcon } from '../components/svg-icons.js';
import { createHabitLibraryCard } from '../components/habit-library-card.js';
import { showToast } from './notifications.js';
import { getTodayStr } from './date-utils.js';

export function renderHabitLibraryView(container) {
  const userHabits = stateManager.getHabits();
  const addedNames = new Set(userHabits.map(h => h.name.toLowerCase()));

  const categories = ['All', 'Study', 'Health', 'Fitness', 'Personal', 'Productivity', 'Mindfulness'];

  const html = `
    <div class="section-fade-in">
      <div class="habits-toolbar">
        <div>
          <h2>Master 99+ Habit Library</h2>
          <p>Browse pre-defined habits curated by category and add them to your daily tracking roster.</p>
        </div>
      </div>

      <div class="habits-toolbar">
        <div class="habits-search-filter">
          <div class="search-input-wrapper">
            <span class="search-icon-inside">${renderIcon('search')}</span>
            <input type="text" class="form-control" id="libSearchInput" placeholder="Search 99+ library habits..." />
          </div>

          <select class="form-control category-filter-select" id="libCategoryFilter">
            ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="library-grid" id="libraryGrid">
        ${ADMIN_HABIT_LIBRARY.map(item => {
          const isAdded = addedNames.has(item.name.toLowerCase());
          return createHabitLibraryCard(item, isAdded);
        }).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;
  bindLibraryEvents(container);
}

function bindLibraryEvents(container) {
  const searchInput = container.querySelector('#libSearchInput');
  const categoryFilter = container.querySelector('#libCategoryFilter');

  if (searchInput && categoryFilter) {
    const filterFn = () => {
      const query = searchInput.value.toLowerCase();
      const cat = categoryFilter.value;
      const cards = container.querySelectorAll('.library-card');

      cards.forEach(card => {
        const title = card.querySelector('.library-card-title').textContent.toLowerCase();
        const badge = card.querySelector('.badge').textContent.trim();
        const matchesQuery = title.includes(query);
        const matchesCat = cat === 'All' || badge === cat;

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

  container.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="select-library-habit"]');
    if (addBtn) {
      const libId = addBtn.dataset.libId;
      const libItem = ADMIN_HABIT_LIBRARY.find(i => i.id === libId);
      if (libItem) {
        const startDate = prompt(`Set Start Date for "${libItem.name}" (YYYY-MM-DD):`, getTodayStr());
        if (!startDate) return;

        stateManager.addHabit({
          name: libItem.name,
          category: libItem.category,
          monthlyGoal: libItem.defaultGoal,
          description: libItem.description,
          startDate: startDate,
          color: getRandomCategoryColor(libItem.category)
        });

        addBtn.disabled = true;
        addBtn.textContent = 'Added ✓';
        addBtn.classList.remove('btn-primary');
        addBtn.classList.add('btn-outline');
        showToast(`Added "${libItem.name}" starting ${startDate}`);
      }
    }
  });
}

function getRandomCategoryColor(category) {
  const colors = {
    Study: '#3B82F6',
    Health: '#10B981',
    Fitness: '#F59E0B',
    Personal: '#8B5CF6',
    Productivity: '#06B6D4',
    Mindfulness: '#FF4F9A'
  };
  return colors[category] || '#FF4F9A';
}
