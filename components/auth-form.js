/* HabitFlow Authentication Welcome & Login/Register Component */

import { renderIcon } from './svg-icons.js';

export function createAuthFormHTML(mode = 'login') {
  const isLogin = mode === 'login';

  return `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-header">
          <div style="margin-bottom:0.75rem;">
            <img src="assets/logo/logo.png" alt="HabitFlow Logo" style="width:64px; height:64px; border-radius:14px; box-shadow:var(--shadow-pink);" />
          </div>
          <h1 class="auth-title">HabitFlow</h1>
          <p class="auth-subtitle">Build better habits. Track progress. Stay consistent.</p>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab-btn ${isLogin ? 'active' : ''}" id="tabLoginBtn">Login</button>
          <button class="auth-tab-btn ${!isLogin ? 'active' : ''}" id="tabRegisterBtn">Create Account</button>
        </div>

        <form id="authForm">
          ${!isLogin ? `
            <div class="profile-upload-wrapper">
              <div class="profile-avatar-preview" id="avatarPreviewBox">
                <span class="profile-avatar-placeholder">HF</span>
              </div>
              <label class="btn btn-outline btn-sm" style="cursor:pointer;">
                ${renderIcon('edit')} Select Profile Picture
                <input type="file" id="profileImageFileInput" accept="image/*" style="display:none;" />
              </label>
            </div>

            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" class="form-control" id="regFullName" placeholder="e.g. Mohan" required />
            </div>
          ` : ''}

          <div class="form-group">
            <label class="form-label">Email Address *</label>
            <input type="email" class="form-control" id="authEmail" placeholder="name@example.com" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password *</label>
            <input type="password" class="form-control" id="authPassword" placeholder="••••••••" required />
          </div>

          ${!isLogin ? `
            <div class="form-group">
              <label class="form-label">Confirm Password *</label>
              <input type="password" class="form-control" id="regConfirmPassword" placeholder="••••••••" required />
            </div>
          ` : ''}

          <button type="submit" class="btn btn-primary" style="width:100%; padding:0.8rem; margin-top:0.5rem;" id="authSubmitBtn">
            ${isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  `;
}
