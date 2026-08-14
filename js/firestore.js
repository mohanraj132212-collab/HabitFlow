/* HabitFlow Cloud Firestore Database Adapter (Strict Security & Canonical users/{uid} Collection) */

import { 
  db, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, serverTimestamp 
} from './firebase.js';

import { 
  getHabitLogDocId, getGoalDocId, getJournalDocId, getMoodDocId, getScreenTimeDocId, getAchievementDocId 
} from './duplicate-prevention.js';

/* Canonical User Profile Document: users/{uid} & Users/{uid} */
export async function fetchUserProfile(uid) {
  try {
    const ref1 = doc(db, 'users', uid);
    const snap1 = await getDoc(ref1);
    if (snap1.exists()) return snap1.data();

    const ref2 = doc(db, 'Users', uid);
    const snap2 = await getDoc(ref2);
    if (snap2.exists()) return snap2.data();

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function saveUserProfile(uid, profileData) {
  try {
    const sanitized = { ...profileData };
    delete sanitized.password;
    delete sanitized.confirmPassword;

    // Do NOT overwrite existing profileImageUrl with empty string/null if profileImageUrl is not provided or empty
    if (!sanitized.profileImageUrl || typeof sanitized.profileImageUrl !== 'string' || !sanitized.profileImageUrl.trim()) {
      delete sanitized.profileImageUrl;
    } else {
      sanitized.profileImageUrl = sanitized.profileImageUrl.trim();
    }

    const updatePayload = {
      uid,
      updatedAt: serverTimestamp(),
      ...sanitized
    };

    let success = false;
    let lastError = null;

    // Write to users/{uid} (lowercase - primary in project database)
    try {
      const refUsersLower = doc(db, 'users', uid);
      await setDoc(refUsersLower, updatePayload, { merge: true });
      success = true;
    } catch (e1) {
      console.warn("[Firestore Warning] Save to users/" + uid + " failed:", e1);
      lastError = e1;
    }

    // Write to Users/{uid} (capitalized)
    try {
      const refUsers = doc(db, 'Users', uid);
      await setDoc(refUsers, updatePayload, { merge: true });
      success = true;
    } catch (e2) {
      console.warn("[Firestore Warning] Save to Users/" + uid + " failed:", e2);
      lastError = e2;
    }

    if (!success && lastError) {
      throw lastError;
    }

    return true;
  } catch (error) {
    console.error("Critical error saving profile to Firestore:", error);
    throw error;
  }
}

/* User Habits Collection: users/{uid}/habits/{habitId} */
export async function fetchUserHabits(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'habits');
    const snap = await getDocs(colRef);
    const habits = [];
    snap.forEach(docSnap => {
      habits.push(docSnap.data());
    });
    return habits;
  } catch (error) {
    console.error("Error fetching habits for users/" + uid + ":", error);
    return [];
  }
}

export async function saveUserHabit(uid, habit) {
  try {
    const ref = doc(db, 'users', uid, 'habits', habit.id);
    await setDoc(ref, habit, { merge: true });
  } catch (error) {
    console.error("Error saving habit:", error);
  }
}

export async function deleteUserHabit(uid, habitId) {
  try {
    const ref = doc(db, 'users', uid, 'habits', habitId);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Error deleting habit:", error);
  }
}

/* Habit Logs Collection: users/{uid}/habitLogs/{habitId}_{date} */
export async function fetchUserHabitLogs(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'habitLogs');
    const snap = await getDocs(colRef);
    const logsMap = {};
    
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (!logsMap[data.habitId]) logsMap[data.habitId] = {};
      logsMap[data.habitId][data.dateStr] = data.completed;
    });
    return logsMap;
  } catch (error) {
    console.error("Error fetching habit logs:", error);
    return {};
  }
}

export async function setUserHabitLog(uid, habitId, dateStr, completed) {
  try {
    const docId = getHabitLogDocId(habitId, dateStr);
    const ref = doc(db, 'users', uid, 'habitLogs', docId);
    await setDoc(ref, {
      habitId,
      dateStr,
      completed,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error setting habit log:", error);
  }
}

/* Goals Collection: users/{uid}/goals/{habitId}_{year}_{month} */
export async function fetchUserGoals(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'goals');
    const snap = await getDocs(colRef);
    const goalsMap = {};
    snap.forEach(docSnap => {
      goalsMap[docSnap.id] = docSnap.data();
    });
    return goalsMap;
  } catch (error) {
    console.error("Error fetching goals:", error);
    return {};
  }
}

export async function setUserGoal(uid, habitId, year, month, targetDays) {
  try {
    const docId = getGoalDocId(habitId, year, month);
    const ref = doc(db, 'users', uid, 'goals', docId);
    await setDoc(ref, {
      habitId,
      year,
      month,
      targetDays,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error setting user goal:", error);
  }
}

/* Journal Entries: users/{uid}/journal/{date} */
export async function fetchUserJournal(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'journal');
    const snap = await getDocs(colRef);
    const journalMap = {};
    snap.forEach(docSnap => {
      journalMap[docSnap.id] = docSnap.data();
    });
    return journalMap;
  } catch (error) {
    console.error("Error fetching journal:", error);
    return {};
  }
}

export async function setUserJournal(uid, dateStr, entryData) {
  try {
    const docId = getJournalDocId(dateStr);
    const ref = doc(db, 'users', uid, 'journal', docId);
    await setDoc(ref, {
      dateStr,
      ...entryData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error setting journal entry:", error);
  }
}

/* Mood Logs: users/{uid}/mood/{date} */
export async function fetchUserMood(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'mood');
    const snap = await getDocs(colRef);
    const moodMap = {};
    snap.forEach(docSnap => {
      moodMap[docSnap.id] = docSnap.data();
    });
    return moodMap;
  } catch (error) {
    console.error("Error fetching mood logs:", error);
    return {};
  }
}

export async function setUserMood(uid, dateStr, mood, energy) {
  try {
    const docId = getMoodDocId(dateStr);
    const ref = doc(db, 'users', uid, 'mood', docId);
    await setDoc(ref, {
      dateStr,
      mood,
      energy,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error setting mood log:", error);
  }
}

/* Screen Time Logs: users/{uid}/screenTime/{date} */
export async function fetchUserScreenTime(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'screenTime');
    const snap = await getDocs(colRef);
    const stMap = {};
    snap.forEach(docSnap => {
      stMap[docSnap.id] = docSnap.data();
    });
    return stMap;
  } catch (error) {
    console.error("Error fetching screen time logs:", error);
    return {};
  }
}

export async function setUserScreenTime(uid, dateStr, slots) {
  try {
    const docId = getScreenTimeDocId(dateStr);
    const ref = doc(db, 'users', uid, 'screenTime', docId);
    await setDoc(ref, {
      dateStr,
      ...slots,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error setting screen time log:", error);
  }
}

/* Achievements: users/{uid}/achievements/{achievementId} */
export async function fetchUserAchievements(uid) {
  try {
    const colRef = collection(db, 'users', uid, 'achievements');
    const snap = await getDocs(colRef);
    const achievementsMap = {};
    snap.forEach(docSnap => {
      achievementsMap[docSnap.id] = docSnap.data();
    });
    return achievementsMap;
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return {};
  }
}

export async function setUserAchievement(uid, achievementKey) {
  try {
    const docId = getAchievementDocId(achievementKey);
    const ref = doc(db, 'users', uid, 'achievements', docId);
    await setDoc(ref, {
      achievementKey,
      unlockedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error setting user achievement:", error);
  }
}
