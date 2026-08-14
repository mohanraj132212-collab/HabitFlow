/* HabitFlow Main Entry Point (Fast Startup, Cropper & Auth Flow) */

import { stateManager } from './state.js';
import { initTheme } from './theme.js';
import { Router } from './router.js';
import { initGlobalUI } from './ui.js';
import { listenAuthState, registerAccount, loginAccount } from './auth.js';
import { openCropperModal } from '../components/cropper-modal.js';

import { createSidebar } from '../components/sidebar.js';
import { createHeader } from '../components/header.js';
import { createBottomNav } from '../components/bottom-nav.js';
import { createAuthFormHTML } from '../components/auth-form.js';

import { renderDashboardView } from './dashboard.js';
import { renderHabitsView } from './habits.js';
import { renderHabitLibraryView } from './habit-library-view.js';
import { renderCalendarView } from './calendar.js';
import { renderAnalyticsView } from './analytics.js';
import { renderGoalsView } from './goals.js';
import { renderJournalView } from './journal.js';
import { renderAchievementsView } from './achievements.js';
import { renderSettingsView } from './settings.js';

const routeTitles = {
  dashboard: 'Dashboard',
  habits: 'My Habits',
  'habit-library': '99+ Habit Library',
  calendar: 'Calendar',
  analytics: 'Analytics',
  goals: 'Goals',
  journal: 'Journal',
  achievements: 'Achievements',
  settings: 'Settings'
};

let authMode = 'login';
let selectedProfileBlob = null;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  const appEl = document.getElementById('app');
  if (!appEl) return;

  // Firebase Auth Observer (Fast Auth Check without splash delay)
  listenAuthState(async (userObj) => {
    if (!userObj) {
      renderAuthScreen(appEl);
    } else {
      await stateManager.loadUserData(userObj);
      renderMainAppShell(appEl);
    }
  });
});

function renderAuthScreen(appEl) {
  appEl.innerHTML = createAuthFormHTML(authMode);
  bindAuthScreenEvents(appEl);
}

function bindAuthScreenEvents(appEl) {
  const tabLogin = appEl.querySelector('#tabLoginBtn');
  const tabRegister = appEl.querySelector('#tabRegisterBtn');
  const authForm = appEl.querySelector('#authForm');
  const fileInput = appEl.querySelector('#profileImageFileInput');
  const previewBox = appEl.querySelector('#avatarPreviewBox');

  if (tabLogin) {
    tabLogin.addEventListener('click', () => {
      authMode = 'login';
      selectedProfileBlob = null;
      renderAuthScreen(appEl);
    });
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', () => {
      authMode = 'register';
      renderAuthScreen(appEl);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        openCropperModal(file, (croppedBlob) => {
          selectedProfileBlob = croppedBlob;
          if (previewBox) {
            const previewUrl = URL.createObjectURL(croppedBlob);
            previewBox.innerHTML = `<img src="${previewUrl}" alt="Avatar Preview" style="width:100%; height:100%; object-fit:cover;" />`;
          }
        });
      }
    });
  }

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = appEl.querySelector('#authSubmitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';

      const email = appEl.querySelector('#authEmail').value.trim();
      const password = appEl.querySelector('#authPassword').value;

      try {
        if (authMode === 'login') {
          await loginAccount(email, password);
        } else {
          const name = appEl.querySelector('#regFullName').value.trim();
          const confirmPassword = appEl.querySelector('#regConfirmPassword').value;

          if (!name) {
            alert("Please enter your full name!");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
          }

          if (password !== confirmPassword) {
            alert("Passwords do not match!");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
            return;
          }

          await registerAccount(name, email, password, selectedProfileBlob);
        }
      } catch (err) {
        console.error("Auth submit error:", err);
        alert("Authentication Error: " + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = authMode === 'login' ? 'Sign In' : 'Create Account';
      }
    });
  }
}

function renderMainAppShell(appEl) {
  appEl.innerHTML = `
    <div id="sidebarContainer"></div>
    <div class="main-wrapper">
      <div id="headerContainer"></div>
      <main class="content-body" id="contentBody"></main>
    </div>
    <div id="bottomNavContainer"></div>
  `;

  const sidebarContainer = document.getElementById('sidebarContainer');
  const headerContainer = document.getElementById('headerContainer');
  const contentBody = document.getElementById('contentBody');
  const bottomNavContainer = document.getElementById('bottomNavContainer');

  const routes = {
    dashboard: () => renderDashboardView(contentBody),
    habits: () => renderHabitsView(contentBody),
    'habit-library': () => renderHabitLibraryView(contentBody),
    calendar: () => renderCalendarView(contentBody),
    analytics: () => renderAnalyticsView(contentBody),
    goals: () => renderGoalsView(contentBody),
    journal: () => renderJournalView(contentBody),
    achievements: () => renderAchievementsView(contentBody),
    settings: () => renderSettingsView(contentBody)
  };

  const router = new Router(routes);

  router.onRouteChanged((currentRoute) => {
    sidebarContainer.innerHTML = createSidebar(currentRoute);
    headerContainer.innerHTML = createHeader(routeTitles[currentRoute] || 'HabitFlow', stateManager.state.theme);
    bottomNavContainer.innerHTML = createBottomNav(currentRoute);
  });

  initGlobalUI(router);

  stateManager.subscribe(() => {
    if (stateManager.currentUser) {
      router.navigate(router.currentRoute, false);
    }
  });

  router.init();

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(err => console.warn('SW reg failed:', err));
    });
  }
}
