// EventLog System
// Persistent logging with localStorage

const STORAGE_KEY = 'se_eventlog';

class EventLog {
  constructor() {
    this.logs = this.load();
    this.isOpen = false;
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('EventLog load error:', e);
      return [];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error('EventLog save error:', e);
    }
  }

  log(type, message, meta = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      message,
      meta
    };
    this.logs.unshift(entry); // Newest first

    // Keep last 100 entries
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }

    this.save();
    this.render();

    console.log(`[${type}]`, message, meta);
  }

  clear() {
    this.logs = [];
    this.save();
    this.render();
  }

  toggle() {
    this.isOpen = !this.isOpen;
    const drawer = document.getElementById('eventlog-drawer');
    if (drawer) {
      drawer.classList.toggle('hidden', !this.isOpen);
    }
  }

  formatTimestamp(isoString) {
    const date = new Date(isoString);
    const day = date.getDate();
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const time = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
    return `${day} ${month}, ${time}`;
  }

  render() {
    const container = document.getElementById('eventlog-entries');
    if (!container) return;

    if (this.logs.length === 0) {
      container.innerHTML = '<div class="text-xs text-gray-500 p-4">No events logged yet</div>';
      return;
    }

    container.innerHTML = this.logs.map(entry => {
      const metaStr = Object.keys(entry.meta).length > 0
        ? ' • ' + Object.entries(entry.meta).map(([k, v]) => `${k}=${v}`).join(' • ')
        : '';

      return `
        <div class="eventlog-entry">
          <div class="eventlog-time">${this.formatTimestamp(entry.timestamp)}</div>
          <div class="eventlog-type">[${entry.type}]</div>
          <div class="eventlog-msg">${entry.message}${metaStr}</div>
        </div>
      `;
    }).join('');
  }

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventlog-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.log('export', 'EventLog exported as JSON');
  }

  exportCSV() {
    const headers = ['Timestamp', 'Type', 'Message', 'Meta'];
    const rows = this.logs.map(e => [
      this.formatTimestamp(e.timestamp),
      e.type,
      e.message,
      JSON.stringify(e.meta)
    ]);

    const csv = [headers, ...rows].map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventlog-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.log('export', 'EventLog exported as CSV');
  }

  copyAll() {
    const text = this.logs.map(e =>
      `[${this.formatTimestamp(e.timestamp)}] [${e.type}] ${e.message}`
    ).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      alert('EventLog copied to clipboard ✓');
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  }
}

// Global instance
export const eventLog = new EventLog();
