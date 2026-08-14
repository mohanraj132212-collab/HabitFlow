/* HabitFlow Interactive Cropper Modal UI Component */

import { renderIcon } from './svg-icons.js';
import { ImageCropper } from '../js/cropper.js';

export function openCropperModal(file, onApplyCallback) {
  let modal = document.getElementById('cropperModalOverlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cropperModalOverlay';
    modal.className = 'cropper-modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="cropper-card">
      <div class="cropper-header">
        <h3>Crop Profile Picture</h3>
        <button class="btn-icon" id="cropperCancelBtn">${renderIcon('cross')}</button>
      </div>

      <div class="cropper-body">
        <div class="cropper-canvas-container">
          <canvas id="cropperCanvas"></canvas>
          <div class="cropper-mask"></div>
        </div>

        <div class="cropper-controls">
          <button class="btn-icon btn-sm" id="zoomOutBtn" title="Zoom Out">-</button>
          <input type="range" min="0.5" max="3.5" step="0.05" value="1" class="form-control cropper-zoom-slider" id="cropperZoomSlider" />
          <button class="btn-icon btn-sm" id="zoomInBtn" title="Zoom In">+</button>
          <button class="btn-icon btn-sm" id="resetCropperBtn" title="Reset Position">${renderIcon('star')}</button>
        </div>
      </div>

      <div class="cropper-footer">
        <button class="btn btn-outline" id="cropperCloseBtn">Cancel</button>
        <button class="btn btn-primary" id="cropperApplyBtn">Apply & Crop</button>
      </div>
    </div>
  `;

  const canvas = modal.querySelector('#cropperCanvas');
  const slider = modal.querySelector('#cropperZoomSlider');
  const zoomIn = modal.querySelector('#zoomInBtn');
  const zoomOut = modal.querySelector('#zoomOutBtn');
  const resetBtn = modal.querySelector('#resetCropperBtn');
  const cancelBtn = modal.querySelector('#cropperCancelBtn');
  const closeBtn = modal.querySelector('#cropperCloseBtn');
  const applyBtn = modal.querySelector('#cropperApplyBtn');

  const cropper = new ImageCropper(canvas, file);

  cropper.onReadyCallback = () => {
    slider.min = cropper.minScale;
    slider.max = cropper.maxScale;
    slider.value = cropper.scale;
  };

  slider.addEventListener('input', (e) => {
    cropper.setZoom(parseFloat(e.target.value));
  });

  zoomIn.addEventListener('click', () => {
    const nextVal = Math.min(cropper.maxScale, cropper.scale + 0.25);
    cropper.setZoom(nextVal);
    slider.value = nextVal;
  });

  zoomOut.addEventListener('click', () => {
    const nextVal = Math.max(cropper.minScale, cropper.scale - 0.25);
    cropper.setZoom(nextVal);
    slider.value = nextVal;
  });

  resetBtn.addEventListener('click', () => {
    cropper.resetPosition();
    cropper.render();
    slider.value = cropper.scale;
  });

  const closeModal = () => {
    modal.remove();
  };

  cancelBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  applyBtn.addEventListener('click', async () => {
    applyBtn.disabled = true;
    applyBtn.textContent = 'Processing...';
    try {
      const croppedBlob = await cropper.exportCroppedBlob(256);
      closeModal();
      if (onApplyCallback) onApplyCallback(croppedBlob);
    } catch (e) {
      alert("Crop error: " + e.message);
      applyBtn.disabled = false;
      applyBtn.textContent = 'Apply & Crop';
    }
  });
}
