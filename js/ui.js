/* HabitFlow UI & Modal Controller */

import { stateManager } from './state.js';
import { createModalHTML } from '../components/modal.js';
import { toggleTheme } from './theme.js';
import { exportHabitsToCSV, downloadJSONBackup } from './export.js';
import { printHabitTracker } from './pdf.js';
import { showToast } from './notifications.js';

let activeEditingHabitId = null;

export function initGlobalUI(routerInstance) {
  renderModalsContainer();
  bindGlobalClickEvents(routerInstance);
}

function renderModalsContainer() {
  let modalContainer = document.getElementById('modalsContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'modalsContainer';
    document.body.appendChild(modalContainer);
  }

  const addHabitModal = createModalHTML(
    'addHabitModal',
    'Create New Habit',
    `
      <form id="addHabitForm">
        <div class="form-group">
          <label class="form-label">Habit Name *</label>
          <input type="text" class="form-control" id="habitNameInput" placeholder="e.g. Read 20 Pages" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-control" id="habitCategoryInput">
              <option value="Health">Health</option>
              <option value="Mindfulness">Mindfulness</option>
              <option value="Learning">Learning</option>
              <option value="Career">Career</option>
              <option value="Fitness">Fitness</option>
              <option value="General">General</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Monthly Target Days</label>
            <input type="number" class="form-control" id="habitTargetInput" value="20" min="1" max="31" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Color Accent</label>
            <input type="color" class="form-control" id="habitColorInput" value="#FF4F9A" style="height:42px; padding:2px;" />
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <input type="text" class="form-control" id="habitDescInput" placeholder="Optional notes" />
          </div>
        </div>
      </form>
    `,
    `
      <button class="btn btn-outline modal-close-btn" data-modal-id="addHabitModal">Cancel</button>
      <button class="btn btn-primary" id="saveNewHabitBtn">Create Habit</button>
    `
  );

  modalContainer.innerHTML = addHabitModal;

  // Bind Form Save Action
  const saveBtn = document.getElementById('saveNewHabitBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const name = document.getElementById('habitNameInput').value.trim();
      if (!name) {
        alert("Please enter a habit name!");
        return;
      }

      const habitData = {
        name,
        category: document.getElementById('habitCategoryInput').value,
        monthlyGoal: parseInt(document.getElementById('habitTargetInput').value, 10) || 20,
        color: document.getElementById('habitColorInput').value,
        description: document.getElementById('habitDescInput').value
      };

      stateManager.addHabit(habitData);
      closeModal('addHabitModal');
      showToast(`Habit "${name}" created successfully!`);
    });
  }
}

export function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('active');
}

export function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('active');
}

function bindGlobalClickEvents(routerInstance) {
  document.addEventListener('click', (e) => {
    // Navigation items
    const navItem = e.target.closest('[data-route]');
    if (navItem) {
      e.preventDefault();
      const route = navItem.dataset.route;
      routerInstance.navigate(route);
      return;
    }

    // Theme toggle
    if (e.target.closest('#themeToggleBtn')) {
      toggleTheme();
      return;
    }

    // Modal triggers
    if (e.target.closest('#dashAddHabitBtn') || e.target.closest('#openAddHabitModalBtn')) {
      openModal('addHabitModal');
      return;
    }

    // Modal Close buttons
    const closeBtn = e.target.closest('.modal-close-btn');
    if (closeBtn) {
      closeModal(closeBtn.dataset.modalId);
      return;
    }

    // Toggle today habit completion
    const toggleBtn = e.target.closest('[data-action="toggle-today"]');
    if (toggleBtn) {
      const habitId = toggleBtn.dataset.habitId;
      const todayStr = new Date().toISOString().split('T')[0];
      stateManager.toggleHabitLog(habitId, todayStr);
      return;
    }

    // Toggle Grid cell completion
    const gridCell = e.target.closest('[data-action="toggle-grid-cell"]');
    if (gridCell) {
      const habitId = gridCell.dataset.habitId;
      const dateStr = gridCell.dataset.date;
      stateManager.toggleHabitLog(habitId, dateStr);
      return;
    }

    // Delete habit
    const deleteBtn = e.target.closest('[data-action="delete-habit"]');
    if (deleteBtn) {
      const habitId = deleteBtn.dataset.habitId;
      if (confirm("Are you sure you want to delete this habit?")) {
        stateManager.deleteHabit(habitId);
        showToast("Habit deleted");
      }
      return;
    }

    // Settings Data Export actions
    if (e.target.closest('#exportCsvBtn')) {
      const today = new Date();
      exportHabitsToCSV(today.getFullYear(), today.getMonth());
      return;
    }

    if (e.target.closest('#exportJsonBtn')) {
      downloadJSONBackup();
      return;
    }

    if (e.target.closest('#printPdfBtn')) {
      printHabitTracker();
      return;
    }

    if (e.target.closest('#resetDataBtn')) {
      if (confirm("Are you sure you want to reset all local habit data?")) {
        stateManager.resetAllData();
        showToast("Data reset to defaults");
      }
      return;
    }
  });
}
