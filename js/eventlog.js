// ScaleEdge ICE - Event Logging System
// =====================================

export class EventLog {
    constructor() {
        this.logs = this.loadFromStorage();
    }

    log(engine, message) {
        const timestamp = this.getTimestamp();
        const entry = {
            timestamp,
            engine,
            message
        };

        this.logs.push(entry);
        this.saveToStorage();

        // Also log to console for debugging
        console.log(`[${timestamp}] [${engine}] ${message}`);
    }

    getLogs() {
        return this.logs;
    }

    clear() {
        this.logs = [];
        this.saveToStorage();
    }

    getTimestamp() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('ice_event_log');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load event log from storage:', error);
            return [];
        }
    }

    saveToStorage() {
        try {
            // Keep only last 100 entries
            const logsToSave = this.logs.slice(-100);
            localStorage.setItem('ice_event_log', JSON.stringify(logsToSave));
        } catch (error) {
            console.error('Failed to save event log to storage:', error);
        }
    }
}
