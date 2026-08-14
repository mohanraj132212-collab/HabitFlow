/* HabitFlow Settings View Controller (User Profile & Cropper Integration) */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { logoutAccount, updateAccountProfile, deleteAccountPermanently } from './auth.js';
import { openCropperModal } from '../components/cropper-modal.js';
import { showToast } from './notifications.js';

export function renderSettingsView(container) {
  const currentTheme = stateManager.state.theme || 'light';
  const user = stateManager.currentUser || { name: 'User', email: '', profileImageUrl: '' };

  const html = `
    <div class="section-fade-in">
      <div style="margin-bottom:1.5rem;">
        <h2>Settings</h2>
        <p>Manage profile, security, appearance, and data export.</p>
      </div>

      <div class="settings-grid">
        <!-- Account Profile Settings -->
        <div class="settings-group-card">
          <div class="settings-group-title">
            ${renderIcon('star')} Account Profile
          </div>

          <div style="display:flex; align-items:center; gap:1rem; margin:1rem 0; padding-bottom:1rem; border-bottom:1px solid var(--border-color-subtle);">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--primary-pink); color:white; font-size:1.5rem; font-weight:700; display:flex; align-items:center; justify-content:center; overflow:hidden;">
              ${user.profileImageUrl ? `<img src="${user.profileImageUrl}" style="width:100%; height:100%; object-fit:cover;" alt="Avatar"/>` : 'HF'}
            </div>
            <div>
              <h3 style="font-size:1.1rem;">${user.name}</h3>
              <p style="font-size:0.85rem; color:var(--text-muted);">${user.email}</p>
            </div>
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Display Name</span>
              <span class="settings-item-desc">Change your saved name</span>
            </div>
            <button class="btn btn-outline btn-sm" id="editNameBtn">Edit Name</button>
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Profile Picture</span>
              <span class="settings-item-desc">Interactive 1:1 square crop & WebP upload</span>
            </div>
            <label class="btn btn-outline btn-sm" style="cursor:pointer;">
              Change Photo
              <input type="file" id="settingsProfilePicInput" accept="image/*" style="display:none;" />
            </label>
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Password</span>
              <span class="settings-item-desc">Update Firebase account authentication password</span>
            </div>
            <button class="btn btn-outline btn-sm" id="changePasswordBtn">Change Password</button>
          </div>
        </div>

        <!-- Appearance Card -->
        <div class="settings-group-card">
          <div class="settings-group-title">
            ${renderIcon('sun')} Appearance
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Theme Mode</span>
              <span class="settings-item-desc">Toggle between Light and Dark mode</span>
            </div>
            <button class="btn btn-outline" id="themeToggleSettingBtn">
              ${currentTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        <!-- Data Export & Backup -->
        <div class="settings-group-card">
          <div class="settings-group-title">
            ${renderIcon('download')} Data & Printable Export
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Export Monthly CSV</span>
              <span class="settings-item-desc">Download habit completion grid</span>
            </div>
            <button class="btn btn-secondary btn-sm" id="exportCsvBtn">Export CSV</button>
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Printable Tracker (PDF)</span>
              <span class="settings-item-desc">Print clean habit sheet</span>
            </div>
            <button class="btn btn-outline btn-sm" id="printPdfBtn">${renderIcon('printer')} Print PDF</button>
          </div>
        </div>

        <!-- Account Actions -->
        <div class="settings-group-card">
          <div class="settings-group-title">
            ${renderIcon('lock')} Account Actions
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Sign Out</span>
              <span class="settings-item-desc">Sign out of active account</span>
            </div>
            <button class="btn btn-outline btn-sm" id="logoutBtn">Sign Out</button>
          </div>

          <div class="settings-item">
            <div class="settings-item-label">
              <span class="settings-item-title">Delete Account</span>
              <span class="settings-item-desc">Permanently remove credentials & cloud records</span>
            </div>
            <button class="btn btn-outline btn-sm" id="deleteAccountBtn" style="color:var(--danger); border-color:var(--danger);">Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  bindSettingsEvents(container);
}

function bindSettingsEvents(container) {
  const themeBtn = container.querySelector('#themeToggleSettingBtn');
  const editNameBtn = container.querySelector('#editNameBtn');
  const changePassBtn = container.querySelector('#changePasswordBtn');
  const profilePicInput = container.querySelector('#settingsProfilePicInput');
  const logoutBtn = container.querySelector('#logoutBtn');
  const deleteBtn = container.querySelector('#deleteAccountBtn');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.getElementById('themeToggleBtn')?.click();
      renderSettingsView(container);
    });
  }

  if (editNameBtn) {
    editNameBtn.addEventListener('click', async () => {
      const newName = prompt("Enter new display name:", stateManager.currentUser?.name || '');
      if (newName && newName.trim()) {
        try {
          await updateAccountProfile(stateManager.currentUser.uid, { name: newName.trim() });
          showToast("Name updated successfully!");
          stateManager.currentUser.name = newName.trim();
          renderSettingsView(container);
        } catch (e) {
          alert("Failed to update name: " + e.message);
        }
      }
    });
  }

  if (changePassBtn) {
    changePassBtn.addEventListener('click', async () => {
      const newPass = prompt("Enter new password (min 6 characters):");
      if (newPass && newPass.length >= 6) {
        try {
          await updateAccountProfile(stateManager.currentUser.uid, { password: newPass });
          showToast("Password updated successfully!");
        } catch (e) {
          alert("Failed to update password: " + e.message);
        }
      }
    });
  }

  if (profilePicInput) {
    profilePicInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        openCropperModal(file, async (croppedBlob) => {
          try {
            showToast("Uploading cropped image...");
            await updateAccountProfile(stateManager.currentUser.uid, { croppedImageBlob: croppedBlob });
            showToast("Profile picture updated!");
            renderSettingsView(container);
          } catch (err) {
            alert("Upload error: " + err.message);
          }
        });
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm("Are you sure you want to sign out?")) {
        await logoutAccount();
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm("WARNING: Are you sure you want to permanently delete your account? All data will be removed.")) {
        try {
          await deleteAccountPermanently();
        } catch (e) {
          alert("Account deletion error: " + e.message);
        }
      }
    });
  }
}
