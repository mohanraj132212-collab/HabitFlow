/* HabitFlow Modal Overlay Component */

import { renderIcon } from './svg-icons.js';

export function createModalHTML(id, title, contentHTML, footerHTML = '') {
  return `
    <div class="modal-overlay" id="${id}">
      <div class="modal-card">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="btn-icon modal-close-btn" data-modal-id="${id}">
            ${renderIcon('cross')}
          </button>
        </div>
        <div class="modal-body">
          ${contentHTML}
        </div>
        ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
      </div>
    </div>
  `;
}
