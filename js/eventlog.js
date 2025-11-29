// ============================================================================
// EventLog System - Standalone Module
// ============================================================================
// Comprehensive event tracking with localStorage persistence and export capabilities

class EventLog {
    constructor() {
        this.logs = [];
        this.storageKey = 'se_eventlog';
        this.isOpen = false;
        this.load();
    }

    /**
     * Load logs from localStorage
     */
    load() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (error) {
            console.error('[EventLog] Load error:', error);
            this.logs = [];
        }
    }

    /**
     * Save logs to localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (error) {
            console.error('[EventLog] Save error:', error);
        }
    }

    /**
     * Log an event
     * @param {string} type - Event type (e.g., 'acceptance.pass', 'drip.preview')
     * @param {string} message - Short descriptive message
     * @param {object} meta - Additional metadata
     */
    log(type, message, meta = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            message,
            meta
        };

        // Add to beginning of array (most recent first)
        this.logs.unshift(entry);

        // Persist
        this.save();

        // Re-render if drawer is open
        if (this.isOpen) {
            this.render();
        }

        // Optional console logging for debugging
        console.log(`[EventLog:${type}] ${message}`, meta);
    }

    /**
     * Clear all logs
     */
    clear() {
        if (confirm('Clear all events? This cannot be undone.')) {
            this.logs = [];
            this.save();
            this.render();
            console.log('[EventLog] Cleared all events');
        }
    }

    /**
     * Toggle drawer open/closed
     */
    toggle() {
        const drawer = document.getElementById('eventlog-drawer');
        if (!drawer) {
            console.warn('[EventLog] Drawer element not found');
            return;
        }

        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            drawer.classList.remove('hidden');
            drawer.classList.add('flex');
            this.render();
        } else {
            drawer.classList.add('hidden');
            drawer.classList.remove('flex');
        }
    }

    /**
     * Copy all logs as formatted text
     */
    copyAll() {
        const text = this.logs.map(entry => {
            const time = this.formatTimestamp(entry.timestamp);
            const metaStr = Object.keys(entry.meta).length > 0
                ? ` | ${JSON.stringify(entry.meta)}`
                : '';
            return `[${time}] [${entry.type}] ${entry.message}${metaStr}`;
        }).join('\n');

        this.copyToClipboard(text);
    }

    /**
     * Export logs as JSON file
     */
    exportJSON() {
        const data = JSON.stringify(this.logs, null, 2);
        this.download('eventlog.json', data, 'application/json');
        this.log('export.json', 'EventLog exported as JSON', { count: this.logs.length });
    }

    /**
     * Export logs as CSV file
     */
    exportCSV() {
        // CSV header
        let csv = 'Timestamp,Type,Message,Meta\n';

        // CSV rows
        this.logs.forEach(entry => {
            const timestamp = entry.timestamp;
            const type = entry.type;
            const message = this.escapeCSV(entry.message);
            const meta = this.escapeCSV(JSON.stringify(entry.meta));
            csv += `${timestamp},${type},"${message}","${meta}"\n`;
        });

        this.download('eventlog.csv', csv, 'text/csv');
        this.log('export.csv', 'EventLog exported as CSV', { count: this.logs.length });
    }

    /**
     * Format ISO timestamp to human-friendly format
     * @param {string} iso - ISO timestamp
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(iso) {
        const date = new Date(iso);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // Relative time for recent events
        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        // Absolute time for older events
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Render logs into the drawer
     */
    render() {
        const container = document.getElementById('eventlog-entries');
        if (!container) {
            console.warn('[EventLog] Entries container not found');
            return;
        }

        if (this.logs.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <p class="text-sm">No events logged yet</p>
                    <p class="text-xs mt-2">Events will appear here as you interact with the app</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.logs.map((entry, index) => {
            const time = this.formatTimestamp(entry.timestamp);
            const typeClass = this.getTypeClass(entry.type);
            const metaPreview = Object.keys(entry.meta).length > 0
                ? `<pre class="text-xs text-gray-600 mt-1 overflow-x-auto">${JSON.stringify(entry.meta, null, 2)}</pre>`
                : '';

            return `
                <div class="eventlog-entry p-3 border-b border-gray-200 hover:bg-gray-50">
                    <div class="flex items-start justify-between gap-2">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-xs font-mono px-2 py-0.5 rounded ${typeClass}">${entry.type}</span>
                                <span class="text-xs text-gray-500">${time}</span>
                            </div>
                            <p class="text-sm text-gray-900">${entry.message}</p>
                            ${metaPreview}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get CSS class for event type
     */
    getTypeClass(type) {
        if (type.startsWith('acceptance')) return 'bg-green-100 text-green-800';
        if (type.startsWith('error') || type.startsWith('fixture.error')) return 'bg-red-100 text-red-800';
        if (type.startsWith('drip')) return 'bg-blue-100 text-blue-800';
        if (type.startsWith('gate')) return 'bg-purple-100 text-purple-800';
        if (type.startsWith('calendar')) return 'bg-yellow-100 text-yellow-800';
        if (type.startsWith('payment')) return 'bg-green-100 text-green-800';
        if (type.startsWith('proofloop')) return 'bg-pink-100 text-pink-800';
        if (type.startsWith('traffic')) return 'bg-indigo-100 text-indigo-800';
        if (type.startsWith('export')) return 'bg-cyan-100 text-cyan-800';
        return 'bg-gray-100 text-gray-800';
    }

    /**
     * Helper: Copy text to clipboard
     */
    copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            }).catch(err => {
                console.error('[EventLog] Copy failed:', err);
                this.fallbackCopy(text);
            });
        } else {
            this.fallbackCopy(text);
        }
    }

    /**
     * Fallback clipboard copy using textarea
     */
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert('Copied to clipboard!');
        } catch (err) {
            console.error('[EventLog] Fallback copy failed:', err);
            alert('Copy failed. Please copy manually from console.');
            console.log(text);
        }
        document.body.removeChild(textarea);
    }

    /**
     * Helper: Download file
     */
    download(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Helper: Escape CSV field
     */
    escapeCSV(str) {
        if (typeof str !== 'string') str = String(str);
        return str.replace(/"/g, '""');
    }
}

// Create singleton instance
const eventLog = new EventLog();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventLog, eventLog };
}
