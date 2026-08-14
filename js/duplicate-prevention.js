/* HabitFlow Duplicate Data Prevention Helper Functions */

export function getHabitLogDocId(habitId, dateStr) {
  return `${habitId}_${dateStr}`;
}

export function getGoalDocId(habitId, year, month) {
  const mStr = String(month + 1).padStart(2, '0');
  return `${habitId}_${year}_${mStr}`;
}

export function getJournalDocId(dateStr) {
  return `${dateStr}`;
}

export function getMoodDocId(dateStr) {
  return `${dateStr}`;
}

export function getScreenTimeDocId(dateStr) {
  return `${dateStr}`;
}

export function getAchievementDocId(achievementKey) {
  return `${achievementKey}`;
}
