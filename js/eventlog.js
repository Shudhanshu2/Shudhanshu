/**
 * ScaleEdge ICE - EventLog System
 * Persistent logging with localStorage, exports, and UI rendering
 */

class EventLog {
    constructor() {
        this.logs = [];
        this.isOpen = false;
        this.load();
    }

    /**
     * Load logs from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem('se_eventlog');
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('EventLog: Failed to load from localStorage', error);
            this.logs = [];
        }
    }

    /**
     * Save logs to localStorage
     */
    save() {
        try {
            localStorage.setItem('se_eventlog', JSON.stringify(this.logs));
        } catch (error) {
            console.error('EventLog: Failed to save to localStorage', error);
        }
    }

    /**
     * Log a new entry
     * @param {string} type - Log type (e.g., 'acceptance.pass', 'drip.preview')
     * @param {string} message - Log message
     * @param {object} meta - Additional metadata
     */
    log(type, message, meta = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            meta
        };

        this.logs.unshift(entry); // Add to beginning

        // Keep only last 500 entries to prevent localStorage overflow
        if (this.logs.length > 500) {
            this.logs = this.logs.slice(0, 500);
        }

        this.save();
        this.render();

        // Also log to console for debugging
        console.log(`[${type}]`, message, meta);
    }

    /**
     * Clear all logs
     */
    clear() {
        if (confirm('Clear all EventLog entries? This cannot be undone.')) {
            this.logs = [];
            this.save();
            this.render();
            console.log('EventLog cleared');
        }
    }

    /**
     * Toggle drawer visibility
     */
    toggle() {
        this.isOpen = !this.isOpen;
        const drawer = document.getElementById('eventlog-drawer');
        if (drawer) {
            drawer.classList.toggle('hidden', !this.isOpen);
        }
    }

    /**
     * Copy all logs to clipboard as formatted text
     */
    copyAll() {
        const text = this.logs.map(log => {
            const time = this.formatTimestamp(log.timestamp);
            const metaStr = Object.keys(log.meta).length > 0
                ? ` | ${JSON.stringify(log.meta)}`
                : '';
            return `[${time}] [${log.type}] ${log.message}${metaStr}`;
        }).join('\n');

        navigator.clipboard.writeText(text).then(() => {
            alert('EventLog copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    }

    /**
     * Export logs as JSON file
     */
    exportJSON() {
        const data = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eventlog_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('export.json', 'EventLog exported as JSON', { count: this.logs.length });
    }

    /**
     * Export logs as CSV file
     */
    exportCSV() {
        const headers = ['Timestamp', 'Type', 'Message', 'Meta'];
        const rows = this.logs.map(log => [
            log.timestamp,
            log.type,
            log.message,
            JSON.stringify(log.meta)
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eventlog_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('export.csv', 'EventLog exported as CSV', { count: this.logs.length });
    }

    /**
     * Format ISO timestamp to human-friendly format
     * @param {string} iso - ISO timestamp string
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(iso) {
        const date = new Date(iso);
        const time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        const dateStr = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
        return `${dateStr} ${time}`;
    }

    /**
     * Render logs to the UI
     */
    render() {
        const container = document.getElementById('eventlog-entries');
        if (!container) return;

        if (this.logs.length === 0) {
            container.innerHTML = '<div class="text-gray-500 text-sm p-4 text-center">No events logged yet</div>';
            return;
        }

        container.innerHTML = this.logs.map(log => {
            const time = this.formatTimestamp(log.timestamp);
            const hasMeta = Object.keys(log.meta).length > 0;

            return `
                <div class="eventlog-entry">
                    <div class="eventlog-time">${time}</div>
                    <div class="eventlog-type">${log.type}</div>
                    <div class="eventlog-message">${this.escapeHtml(log.message)}</div>
                    ${hasMeta ? `
                        <div class="eventlog-meta">
                            <button class="eventlog-meta-toggle" onclick="this.nextElementSibling.classList.toggle('hidden')">
                                meta ▼
                            </button>
                            <pre class="eventlog-meta-content hidden">${this.escapeHtml(JSON.stringify(log.meta, null, 2))}</pre>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Create and export singleton instance
const eventLog = new EventLog();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventLog, eventLog };
}
