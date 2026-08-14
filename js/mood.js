/* HabitFlow Mood & Energy Tracking Controller */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { showToast } from './notifications.js';

export function renderMoodView(container) {
  const todayStr = new Date().toISOString().split('T')[0];
  const moodLogs = stateManager.state.moodLogs || {};
  const currentTodayLog = moodLogs[todayStr] || { mood: 4, energy: 7 };

  const moods = [
    { level: 5, label: 'Very Happy', emoji: '😄' },
    { level: 4, label: 'Happy', emoji: '🙂' },
    { level: 3, label: 'Neutral', emoji: '😐' },
    { level: 2, label: 'Sad', emoji: '🙁' },
    { level: 1, label: 'Very Sad', emoji: '😫' }
  ];

  const html = `
    <div class="mood-tracker-card">
      <h3>Today's Mood & Energy</h3>
      <p>Log your daily emotional state and physical energy levels.</p>

      <div class="mood-options-row">
        ${moods.map(m => `
          <button class="mood-option-btn ${currentTodayLog.mood === m.level ? 'selected' : ''}" data-mood-val="${m.level}">
            <span style="font-size:1.6rem;">${m.emoji}</span>
            <span style="font-size:0.775rem; font-weight:600;">${m.label}</span>
          </button>
        `).join('')}
      </div>

      <div class="energy-slider-container">
        <label class="form-label" style="display:flex; justify-content:space-between;">
          <span>Energy Level (1–10)</span>
          <strong id="energyValueText">${currentTodayLog.energy} / 10</strong>
        </label>
        <input type="range" min="1" max="10" value="${currentTodayLog.energy}" class="form-control" id="energyRangeInput" />
        <div class="energy-slider-labels">
          <span>Low Energy</span>
          <span>Moderate</span>
          <span>Peak Energy ⚡</span>
        </div>
      </div>

      <button class="btn btn-primary" id="saveMoodBtn">Save Today's Mood & Energy</button>
    </div>
  `;

  return html;
}

export function bindMoodEvents(container) {
  const saveBtn = container.querySelector('#saveMoodBtn');
  const energyInput = container.querySelector('#energyRangeInput');
  const energyText = container.querySelector('#energyValueText');
  const moodBtns = container.querySelectorAll('.mood-option-btn');

  let selectedMood = 4;

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedMood = parseInt(btn.dataset.moodVal, 10);
    });
  });

  if (energyInput && energyText) {
    energyInput.addEventListener('input', (e) => {
      energyText.textContent = `${e.target.value} / 10`;
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const energyVal = parseInt(energyInput ? energyInput.value : 7, 10);
      const todayStr = new Date().toISOString().split('T')[0];
      stateManager.saveMood(todayStr, selectedMood, energyVal);
      showToast('Today\'s Mood & Energy saved successfully!');
    });
  }
}
