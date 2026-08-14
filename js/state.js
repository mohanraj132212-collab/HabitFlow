/* HabitFlow Central State Engine (Cloud Firestore Multi-Device Sync) */

import { 
  fetchUserHabits, saveUserHabit, deleteUserHabit, 
  fetchUserHabitLogs, setUserHabitLog, 
  fetchUserGoals, setUserGoal, 
  fetchUserJournal, setUserJournal, 
  fetchUserMood, setUserMood, 
  fetchUserScreenTime, setUserScreenTime, 
  fetchUserAchievements, setUserAchievement 
} from './firestore.js';

class StateManager {
  constructor() {
    this.listeners = [];
    this.currentUser = null;
    this.state = this.getEmptyState();
    this.isLoading = true;
  }

  getEmptyState() {
    return {
      habits: [],            // 0 habits for new accounts
      habitLogs: {},         // { habitId: { 'YYYY-MM-DD': boolean } }
      goals: {},             // { habitId_YYYY_MM: { targetDays } }
      journalEntries: {},    // { 'YYYY-MM-DD': { note, reflection, wins } }
      moodLogs: {},          // { 'YYYY-MM-DD': { mood, energy } }
      screenTimeLogs: {},    // { 'YYYY-MM-DD': { morning, afternoon, evening, night } }
      achievements: {},      // { achievementKey: { unlockedAt } }
      theme: localStorage.getItem('habitflow_theme') || 'light'
    };
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  async loadUserData(userObj) {
    this.currentUser = userObj;
    if (!userObj) {
      this.state = this.getEmptyState();
      this.isLoading = false;
      this.notify();
      return;
    }

    this.isLoading = true;
    this.notify();

    try {
      const [habits, habitLogs, goals, journalEntries, moodLogs, screenTimeLogs, achievements] = await Promise.all([
        fetchUserHabits(userObj.uid),
        fetchUserHabitLogs(userObj.uid),
        fetchUserGoals(userObj.uid),
        fetchUserJournal(userObj.uid),
        fetchUserMood(userObj.uid),
        fetchUserScreenTime(userObj.uid),
        fetchUserAchievements(userObj.uid)
      ]);

      this.state.habits = habits || [];
      this.state.habitLogs = habitLogs || {};
      this.state.goals = goals || {};
      this.state.journalEntries = journalEntries || {};
      this.state.moodLogs = moodLogs || {};
      this.state.screenTimeLogs = screenTimeLogs || {};
      this.state.achievements = achievements || {};
    } catch (err) {
      console.error("Error loading Cloud Firestore data:", err);
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  getHabits() {
    return this.state.habits || [];
  }

  async addHabit(habitData) {
    if (!this.currentUser) return null;
    const newHabit = {
      id: 'h_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      name: habitData.name,
      category: habitData.category || 'General',
      monthlyGoal: parseInt(habitData.monthlyGoal, 10) || 20,
      color: habitData.color || '#FF4F9A',
      description: habitData.description || '',
      startDate: habitData.startDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // Optimistic local state update
    this.state.habits.unshift(newHabit);
    if (!this.state.habitLogs[newHabit.id]) {
      this.state.habitLogs[newHabit.id] = {};
    }
    this.notify();

    // Persist to Cloud Firestore
    await saveUserHabit(this.currentUser.uid, newHabit);
    return newHabit;
  }

  async updateHabit(habitId, updatedFields) {
    if (!this.currentUser) return;
    const idx = this.state.habits.findIndex(h => h.id === habitId);
    if (idx !== -1) {
      this.state.habits[idx] = { ...this.state.habits[idx], ...updatedFields };
      this.notify();
      await saveUserHabit(this.currentUser.uid, this.state.habits[idx]);
    }
  }

  async deleteHabit(habitId) {
    if (!this.currentUser) return;
    this.state.habits = this.state.habits.filter(h => h.id !== habitId);
    delete this.state.habitLogs[habitId];
    this.notify();
    await deleteUserHabit(this.currentUser.uid, habitId);
  }

  async toggleHabitLog(habitId, dateStr) {
    if (!this.currentUser) return;
    if (!this.state.habitLogs[habitId]) {
      this.state.habitLogs[habitId] = {};
    }
    const current = !!this.state.habitLogs[habitId][dateStr];
    const nextVal = !current;
    this.state.habitLogs[habitId][dateStr] = nextVal;
    this.notify();

    await setUserHabitLog(this.currentUser.uid, habitId, dateStr, nextVal);
  }

  async saveMood(dateStr, moodVal, energyVal) {
    if (!this.currentUser) return;
    this.state.moodLogs[dateStr] = { mood: moodVal, energy: energyVal };
    this.notify();
    await setUserMood(this.currentUser.uid, dateStr, moodVal, energyVal);
  }

  async saveScreenTime(dateStr, slots) {
    if (!this.currentUser) return;
    this.state.screenTimeLogs[dateStr] = slots;
    this.notify();
    await setUserScreenTime(this.currentUser.uid, dateStr, slots);
  }

  async saveJournalEntry(dateStr, entryObj) {
    if (!this.currentUser) return;
    this.state.journalEntries[dateStr] = entryObj;
    this.notify();
    await setUserJournal(this.currentUser.uid, dateStr, entryObj);
  }

  setTheme(themeName) {
    this.state.theme = themeName;
    localStorage.setItem('habitflow_theme', themeName);
    this.notify();
  }
}

export const stateManager = new StateManager();
