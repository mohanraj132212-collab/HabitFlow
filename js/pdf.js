/* HabitFlow Print & PDF View Module */

import { showToast } from './notifications.js';

export function printHabitTracker() {
  showToast('Preparing printable sheet...');
  setTimeout(() => {
    window.print();
  }, 300);
}
