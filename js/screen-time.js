/* HabitFlow Screen Time Tracking Controller */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { showToast } from './notifications.js';

export function renderScreenTimeView(container) {
  const todayStr = new Date().toISOString().split('T')[0];
  const logs = stateManager.state.screenTimeLogs || {};
  const todaySlots = logs[todayStr] || { morning: 1, afternoon: 2.5, evening: 2, night: 0.5 };

  const totalHours = (todaySlots.morning || 0) + (todaySlots.afternoon || 0) + (todaySlots.evening || 0) + (todaySlots.night || 0);

  const html = `
    <div class="screentime-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h3>Screen Time Tracker</h3>
          <p>Monitor your daily digital screen exposure across day time slots.</p>
        </div>
        <span class="badge badge-pink" style="font-size:0.9rem; padding:0.4rem 0.8rem;">
          Total Today: ${totalHours} Hours
        </span>
      </div>

      <div class="screentime-slots-grid">
        <div class="screentime-slot-box">
          <span style="font-weight:700; font-size:0.85rem;">🌅 Morning</span>
          <input type="number" step="0.5" min="0" max="12" class="form-control st-input" id="stMorning" value="${todaySlots.morning || 0}" />
          <small>Hours</small>
        </div>

        <div class="screentime-slot-box">
          <span style="font-weight:700; font-size:0.85rem;">☀️ Afternoon</span>
          <input type="number" step="0.5" min="0" max="12" class="form-control st-input" id="stAfternoon" value="${todaySlots.afternoon || 0}" />
          <small>Hours</small>
        </div>

        <div class="screentime-slot-box">
          <span style="font-weight:700; font-size:0.85rem;">🌆 Evening</span>
          <input type="number" step="0.5" min="0" max="12" class="form-control st-input" id="stEvening" value="${todaySlots.evening || 0}" />
          <small>Hours</small>
        </div>

        <div class="screentime-slot-box">
          <span style="font-weight:700; font-size:0.85rem;">🌙 Night</span>
          <input type="number" step="0.5" min="0" max="12" class="form-control st-input" id="stNight" value="${todaySlots.night || 0}" />
          <small>Hours</small>
        </div>
      </div>

      <button class="btn btn-primary" id="saveScreenTimeBtn">Save Screen Time Log</button>
    </div>
  `;

  return html;
}

export function bindScreenTimeEvents(container) {
  const saveBtn = container.querySelector('#saveScreenTimeBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const slots = {
        morning: parseFloat(container.querySelector('#stMorning').value) || 0,
        afternoon: parseFloat(container.querySelector('#stAfternoon').value) || 0,
        evening: parseFloat(container.querySelector('#stEvening').value) || 0,
        night: parseFloat(container.querySelector('#stNight').value) || 0
      };
      stateManager.saveScreenTime(todayStr, slots);
      showToast('Screen time log saved!');
    });
  }
}
