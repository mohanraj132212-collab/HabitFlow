/* HabitFlow Streak Engine & Stat Calculations */

export function calculateHabitStreak(habitLogs = {}) {
  const dates = Object.keys(habitLogs).filter(d => habitLogs[d]).sort();
  if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 };

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  const todayStr = formatDate(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // Check if today or yesterday was completed for active streak
  let checkDate = new Date();
  if (!habitLogs[todayStr] && habitLogs[yesterdayStr]) {
    checkDate = yesterday;
  }

  while (habitLogs[formatDate(checkDate)]) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate best streak
  let prevDate = null;
  dates.forEach(dStr => {
    const d = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((d - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) bestStreak = tempStreak;
    prevDate = d;
  });

  return { currentStreak, bestStreak };
}

export function calculateOverallStats(habits = [], habitLogsMap = {}, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalPossible = habits.length * daysInMonth;
  let totalCompleted = 0;

  let currentStreaksArr = [];
  let bestStreaksArr = [];

  habits.forEach(h => {
    const logs = habitLogsMap[h.id] || {};
    const stats = calculateHabitStreak(logs);
    currentStreaksArr.push(stats.currentStreak);
    bestStreaksArr.push(stats.bestStreak);

    // Count current month completions
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (logs[dateStr]) totalCompleted++;
    }
  });

  const completionPercentage = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
  const bestOverallStreak = bestStreaksArr.length > 0 ? Math.max(...bestStreaksArr) : 0;
  const currentOverallStreak = currentStreaksArr.length > 0 ? Math.max(...currentStreaksArr) : 0;

  // Productivity score formula combining completion % and active streaks
  const productivityScore = Math.min(100, Math.round(completionPercentage * 0.7 + Math.min(30, currentOverallStreak * 2)));

  return {
    totalHabits: habits.length,
    totalCompleted,
    completionPercentage,
    currentOverallStreak,
    bestOverallStreak,
    productivityScore
  };
}

function formatDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
