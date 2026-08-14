/* HabitFlow Calendar View Controller */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { createSpreadsheetHabitGrid } from '../components/habit-grid.js';

let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth();

export function renderCalendarView(container) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const html = `
    <div class="section-fade-in">
      <div class="calendar-control-bar">
        <div>
          <h2>Monthly Calendar & Grid</h2>
          <p>View completion history and spreadsheet tracking grid for any month.</p>
        </div>

        <div class="calendar-month-year-picker">
          <button class="btn-icon" id="prevMonthBtn" title="Previous Month">${renderIcon('chevronLeft')}</button>
          
          <select class="form-control" id="calendarMonthSelect">
            ${monthNames.map((name, i) => `<option value="${i}" ${i === selectedMonth ? 'selected' : ''}>${name}</option>`).join('')}
          </select>

          <select class="form-control" id="calendarYearSelect">
            <option value="2025" ${selectedYear === 2025 ? 'selected' : ''}>2025</option>
            <option value="2026" ${selectedYear === 2026 ? 'selected' : ''}>2026</option>
            <option value="2027" ${selectedYear === 2027 ? 'selected' : ''}>2027</option>
          </select>

          <button class="btn-icon" id="nextMonthBtn" title="Next Month">${renderIcon('chevronRight')}</button>
        </div>
      </div>

      <!-- Calendar Grid Cards -->
      <div class="calendar-grid-wrapper">
        <div class="calendar-days-header">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="calendar-days-grid">
          ${renderCalendarDays(habits, habitLogs, selectedYear, selectedMonth)}
        </div>
      </div>

      <!-- Full Spreadsheet Grid -->
      ${createSpreadsheetHabitGrid(habits, selectedYear, selectedMonth, habitLogs)}
    </div>
  `;

  container.innerHTML = html;
  bindCalendarEvents(container);
}

function renderCalendarDays(habits, habitLogs, year, month) {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month;
  const currentDayNum = today.getDate();

  let html = '';

  // Blank padded days
  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div class="calendar-day-card other-month"></div>`;
  }

  // Active month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let completedCount = 0;

    habits.forEach(h => {
      if (habitLogs[h.id] && habitLogs[h.id][dateStr]) {
        completedCount++;
      }
    });

    const percent = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
    const isToday = isCurrentMonthYear && day === currentDayNum;

    html += `
      <div class="calendar-day-card ${isToday ? 'today' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="calendar-day-number">${day}</span>
          ${completedCount > 0 ? `<span class="calendar-day-percentage">${percent}%</span>` : ''}
        </div>
        <div class="calendar-day-dots">
          ${Array.from({ length: Math.min(completedCount, 8) }).map(() => `<span class="calendar-dot"></span>`).join('')}
        </div>
      </div>
    `;
  }

  return html;
}

function bindCalendarEvents(container) {
  const monthSelect = container.querySelector('#calendarMonthSelect');
  const yearSelect = container.querySelector('#calendarYearSelect');
  const prevBtn = container.querySelector('#prevMonthBtn');
  const nextBtn = container.querySelector('#nextMonthBtn');

  if (monthSelect && yearSelect) {
    monthSelect.addEventListener('change', (e) => {
      selectedMonth = parseInt(e.target.value, 10);
      renderCalendarView(container);
    });

    yearSelect.addEventListener('change', (e) => {
      selectedYear = parseInt(e.target.value, 10);
      renderCalendarView(container);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (selectedMonth === 0) {
        selectedMonth = 11;
        selectedYear--;
      } else {
        selectedMonth--;
      }
      renderCalendarView(container);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (selectedMonth === 11) {
        selectedMonth = 0;
        selectedYear++;
      } else {
        selectedMonth++;
      }
      renderCalendarView(container);
    });
  }
}
