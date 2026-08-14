/* HabitFlow Date Utility Functions & Start-Date Tracking Calculations */

export function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isDateEligible(dateStr, startDateStr) {
  const todayStr = getTodayStr();
  if (!startDateStr) startDateStr = '2026-01-01';
  // Date must be on or after start date AND on or before today
  return dateStr >= startDateStr && dateStr <= todayStr;
}

export function getEligibleDaysForMonth(startDateStr, year, month) {
  const todayStr = getTodayStr();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let eligibleCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (isDateEligible(dateStr, startDateStr)) {
      eligibleCount++;
    }
  }
  return eligibleCount;
}

export function calculateHabitStats(habit, habitLogsMap = {}, year, month) {
  const startDateStr = habit.startDate || '2026-01-01';
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const habitLogs = habitLogsMap[habit.id] || {};

  let completedDays = 0;
  let eligibleDays = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (isDateEligible(dateStr, startDateStr)) {
      eligibleDays++;
      if (habitLogs[dateStr]) {
        completedDays++;
      }
    }
  }

  const completionRate = eligibleDays > 0 ? Math.round((completedDays / eligibleDays) * 100) : 0;

  return {
    completedDays,
    eligibleDays,
    completionRate,
    monthlyGoal: habit.monthlyGoal || 20
  };
}

export function calculateOverallStats(habits = [], habitLogsMap = {}, year, month) {
  if (!habits || habits.length === 0) {
    return {
      totalHabits: 0,
      todayCompleted: 0,
      todayTotal: 0,
      todayPercentage: 0,
      monthlyCompleted: 0,
      monthlyEligible: 0,
      monthlyPercentage: 0,
      productivityScore: 0
    };
  }

  const todayStr = getTodayStr();
  let todayCompleted = 0;
  let todayTotal = 0;
  let monthlyCompleted = 0;
  let monthlyEligible = 0;

  habits.forEach(h => {
    const stats = calculateHabitStats(h, habitLogsMap, year, month);
    monthlyCompleted += stats.completedDays;
    monthlyEligible += stats.eligibleDays;

    if (isDateEligible(todayStr, h.startDate)) {
      todayTotal++;
      if (habitLogsMap[h.id] && habitLogsMap[h.id][todayStr]) {
        todayCompleted++;
      }
    }
  });

  const todayPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
  const monthlyPercentage = monthlyEligible > 0 ? Math.round((monthlyCompleted / monthlyEligible) * 100) : 0;

  const productivityScore = Math.min(100, Math.round(todayPercentage * 0.4 + monthlyPercentage * 0.6));

  return {
    totalHabits: habits.length,
    todayCompleted,
    todayTotal,
    todayPercentage,
    monthlyCompleted,
    monthlyEligible,
    monthlyPercentage,
    productivityScore
  };
}
