/* HabitFlow Journal View Controller */

import { stateManager } from './state.js';
import { renderIcon } from '../components/svg-icons.js';
import { renderMoodView, bindMoodEvents } from './mood.js';
import { renderScreenTimeView, bindScreenTimeEvents } from './screen-time.js';
import { showToast } from './notifications.js';

let selectedJournalDate = new Date().toISOString().split('T')[0];

export function renderJournalView(container) {
  const entries = stateManager.state.journalEntries || {};
  const currentEntry = entries[selectedJournalDate] || { note: '', reflection: '', wins: '' };

  const entryDates = Object.keys(entries).sort().reverse();
  if (!entryDates.includes(selectedJournalDate)) {
    entryDates.unshift(selectedJournalDate);
  }

  const html = `
    <div class="section-fade-in">
      <div style="margin-bottom:1.5rem;">
        <h2>Daily Journal & Reflections</h2>
        <p>Record notes, reflections, daily wins, mood, and screen time.</p>
      </div>

      <div class="journal-container">
        <!-- Previous Entries List -->
        <div class="journal-sidebar-list">
          <h4>Previous Entries</h4>
          ${entryDates.map(dateStr => `
            <div class="journal-entry-item ${dateStr === selectedJournalDate ? 'active' : ''}" data-date="${dateStr}">
              <div class="journal-entry-item-date">${dateStr}</div>
              <div class="journal-entry-item-snippet">${entries[dateStr]?.note || 'Click to log thoughts...'}</div>
            </div>
          `).join('')}
        </div>

        <!-- Editor & Tracking Forms -->
        <div>
          <div class="journal-editor-card" style="margin-bottom:1.5rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
              <h3>Journal for <span style="color:var(--primary-pink);">${selectedJournalDate}</span></h3>
              <button class="btn btn-primary btn-sm" id="saveJournalBtn">Save Journal Entry</button>
            </div>

            <div class="form-group">
              <label class="form-label">Today's Reflection & Thoughts</label>
              <textarea class="form-control" id="journalNoteInput" placeholder="What is on your mind today?">${currentEntry.note || ''}</textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Key Wins Today ✨</label>
                <textarea class="form-control" id="journalWinsInput" placeholder="List your accomplishments...">${currentEntry.wins || ''}</textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Lessons & Improvements 💡</label>
                <textarea class="form-control" id="journalReflectionInput" placeholder="What could be improved?">${currentEntry.reflection || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- Mood & Screen Time Embedded Cards -->
          <div id="journalMoodContainer">${renderMoodView(container)}</div>
          <div id="journalScreenTimeContainer">${renderScreenTimeView(container)}</div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;

  bindMoodEvents(container);
  bindScreenTimeEvents(container);
  bindJournalEvents(container);
}

function bindJournalEvents(container) {
  const saveBtn = container.querySelector('#saveJournalBtn');
  const items = container.querySelectorAll('.journal-entry-item');

  items.forEach(item => {
    item.addEventListener('click', () => {
      selectedJournalDate = item.dataset.date;
      renderJournalView(container);
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const entryObj = {
        note: container.querySelector('#journalNoteInput').value,
        wins: container.querySelector('#journalWinsInput').value,
        reflection: container.querySelector('#journalReflectionInput').value
      };
      stateManager.saveJournalEntry(selectedJournalDate, entryObj);
      showToast('Journal entry saved!');
    });
  }
}
