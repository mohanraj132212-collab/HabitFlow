/* HabitFlow Spreadsheet Habit Grid Component (Start-Date Aware) */

import { renderIcon } from './svg-icons.js';
import { isDateEligible } from '../js/date-utils.js';

export function createSpreadsheetHabitGrid(habits, year, month, habitLogsMap) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = new Date();
  const isCurrentMonthYear = today.getFullYear() === year && today.getMonth() === month;
  const currentDayNum = today.getDate();

  return `
    <div class="habit-spreadsheet-container">
      <div class="spreadsheet-header-bar">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${renderIcon('calendar')}
          <strong style="font-size:0.95rem;">Spreadsheet Habit Tracker Grid</strong>
        </div>
        <small style="color:var(--text-muted);">${habits.length} Active Habits</small>
      </div>

      <div class="spreadsheet-table-wrapper">
        <table class="spreadsheet-table">
          <thead>
            <tr>
              <th class="col-habit">Habit Name</th>
              <th class="col-goal">Goal</th>
              ${daysArray.map(day => `
                <th class="${isCurrentMonthYear && day === currentDayNum ? 'today-cell' : ''}">${day}</th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${habits.length === 0 ? `
              <tr>
                <td colspan="${daysInMonth + 2}" style="padding: 2.5rem; color: var(--text-muted);">
                  No habits added yet. Click "+ Add Habit" or explore the Habit Library to begin tracking!
                </td>
              </tr>
            ` : habits.map(habit => {
              return `
                <tr>
                  <td class="col-habit">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${habit.color || '#FF4F9A'}; margin-right:0.4rem;"></span>
                    ${habit.name}
                  </td>
                  <td class="col-goal">${habit.monthlyGoal || 20}</td>
                  ${daysArray.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isDone = habitLogsMap[habit.id] && habitLogsMap[habit.id][dateStr];
                    const isTodayCell = isCurrentMonthYear && day === currentDayNum;
                    const eligible = isDateEligible(dateStr, habit.startDate);

                    if (!eligible) {
                      return `
                        <td>
                          <div class="grid-day-cell disabled-cell" 
                               style="opacity:0.25; cursor:not-allowed; background:var(--bg-input);" 
                               title="Inactive: Date prior to habit start date (${habit.startDate}) or in future">
                          </div>
                        </td>
                      `;
                    }

                    return `
                      <td>
                        <div class="grid-day-cell ${isDone ? 'completed' : ''} ${isTodayCell ? 'today-cell' : ''}"
                             data-action="toggle-grid-cell"
                             data-habit-id="${habit.id}"
                             data-date="${dateStr}"
                             title="${habit.name} - ${dateStr}">
                          ${isDone ? renderIcon('check') : ''}
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
