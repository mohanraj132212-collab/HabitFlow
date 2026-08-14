/* HabitFlow Interactive Profile Image Canvas Cropper Engine */

export class ImageCropper {
  constructor(canvasElement, imageFile) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.image = new Image();
    
    this.scale = 1.0;
    this.minScale = 0.5;
    this.maxScale = 3.0;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    this.onReadyCallback = null;
    this.loadImage(imageFile);
  }

  loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.image.onload = () => {
        this.resetPosition();
        this.render();
        if (this.onReadyCallback) this.onReadyCallback();
      };
      this.image.src = e.target.result;
    };
    reader.readAsDataURL(file);

    this.bindEvents();
  }

  resetPosition() {
    this.canvas.width = 300;
    this.canvas.height = 300;
    
    // Calculate initial scale to fit square canvas
    const minDim = Math.min(this.image.width, this.image.height);
    this.scale = 300 / minDim;
    this.minScale = this.scale * 0.5;
    this.maxScale = this.scale * 3.5;
    
    this.offsetX = (300 - this.image.width * this.scale) / 2;
    this.offsetY = (300 - this.image.height * this.scale) / 2;
  }

  render() {
    if (!this.image.complete) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(this.image, 0, 0);
    this.ctx.restore();
  }

  setZoom(zoomVal) {
    // Zoom relative to center
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    const oldScale = this.scale;
    this.scale = Math.max(this.minScale, Math.min(this.maxScale, zoomVal));

    const scaleFactor = this.scale / oldScale;
    this.offsetX = centerX - (centerX - this.offsetX) * scaleFactor;
    this.offsetY = centerY - (centerY - this.offsetY) * scaleFactor;

    this.render();
  }

  bindEvents() {
    const startDrag = (x, y) => {
      this.isDragging = true;
      this.startX = x - this.offsetX;
      this.startY = y - this.offsetY;
    };

    const moveDrag = (x, y) => {
      if (!this.isDragging) return;
      this.offsetX = x - this.startX;
      this.offsetY = y - this.startY;
      this.render();
    };

    const stopDrag = () => {
      this.isDragging = false;
    };

    // Mouse events
    this.canvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener('mouseup', stopDrag);

    // Touch events for mobile
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        moveDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    window.addEventListener('touchend', stopDrag);
  }

  exportCroppedBlob(outputSize = 256) {
    return new Promise((resolve, reject) => {
      const outCanvas = document.createElement('canvas');
      outCanvas.width = outputSize;
      outCanvas.height = outputSize;
      const ctx = outCanvas.getContext('2d');

      ctx.drawImage(
        this.canvas,
        0, 0, 300, 300,
        0, 0, outputSize, outputSize
      );

      outCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          outCanvas.toBlob((jpgBlob) => {
            if (jpgBlob) resolve(jpgBlob);
            else reject(new Error("Image export failed"));
          }, 'image/jpeg', 0.85);
        }
      }, 'image/webp', 0.85);
    });
  }
}
