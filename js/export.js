/* HabitFlow Data Export & Backup Module */

import { stateManager } from './state.js';
import { showToast } from './notifications.js';

export function exportHabitsToCSV(year, month) {
  const habits = stateManager.getHabits();
  const habitLogs = stateManager.state.habitLogs || {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let csvContent = 'Habit Name,Category,Goal';
  for (let d = 1; d <= daysInMonth; d++) {
    csvContent += `,Day ${d}`;
  }
  csvContent += '\n';

  habits.forEach(h => {
    let row = `"${h.name.replace(/"/g, '""')}","${h.category}",${h.monthlyGoal || 20}`;
    const logs = habitLogs[h.id] || {};

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      row += `,${logs[dateStr] ? 'DONE' : '-'}`;
    }
    csvContent += row + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HabitFlow_Export_${year}_${month + 1}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Exported habit data to CSV successfully!');
}

export function downloadJSONBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateManager.state, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `HabitFlow_Backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast('Downloaded full JSON backup!');
}
