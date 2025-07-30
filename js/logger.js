// Logger Module for Application Logging
class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // Maximum number of logs to keep in memory
    }

    // Log levels
    static LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
    };

    // Format timestamp
    formatTimestamp() {
        return new Date().toISOString();
    }

    // Create log entry
    createLogEntry(level, message, data = null, userId = null) {
        const logEntry = {
            timestamp: this.formatTimestamp(),
            level: Object.keys(Logger.LEVELS)[level],
            message,
            data,
            userId,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.getSessionId()
        };

        return logEntry;
    }

    // Get or create session ID
    getSessionId() {
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('sessionId', sessionId);
        }
        return sessionId;
    }

    // Main logging method
    log(level, message, data = null, userId = null) {
        const logEntry = this.createLogEntry(level, message, data, userId);
        
        // Add to memory logs
        this.logs.push(logEntry);
        
        // Remove old logs if exceeding max
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        // Console output with styling
        this.outputToConsole(logEntry);

        // Store in localStorage for persistence
        this.storeLog(logEntry);

        // Send to Firebase if configured
        this.sendToFirebase(logEntry);

        return logEntry;
    }

    // Output formatted log to console
    outputToConsole(logEntry) {
        const styles = {
            DEBUG: 'color: #8e8e93; font-weight: normal;',
            INFO: 'color: #007AFF; font-weight: normal;',
            WARN: 'color: #FF9500; font-weight: bold;',
            ERROR: 'color: #FF3B30; font-weight: bold;',
            CRITICAL: 'color: #FF3B30; font-weight: bold; background: #ffebee; padding: 2px 4px;'
        };

        const style = styles[logEntry.level] || styles.INFO;
        const prefix = `[${logEntry.timestamp}] [${logEntry.level}]`;
        
        console.log(`%c${prefix} ${logEntry.message}`, style, logEntry.data || '');
    }

    // Store log in localStorage
    storeLog(logEntry) {
        try {
            const storedLogs = JSON.parse(localStorage.getItem('appLogs') || '[]');
            storedLogs.push(logEntry);
            
            // Keep only last 500 logs in localStorage
            if (storedLogs.length > 500) {
                storedLogs.splice(0, storedLogs.length - 500);
            }
            
            localStorage.setItem('appLogs', JSON.stringify(storedLogs));
        } catch (error) {
            console.error('Failed to store log:', error);
        }
    }

    // Send log to Firebase (if available) - DISABLED for mock Firebase
    async sendToFirebase(logEntry) {
        try {
            // Disabled Firebase logging to avoid errors with mock Firebase
            console.log('📝 Log entry (Firebase disabled):', logEntry);
        } catch (error) {
            console.error('Failed to send log to Firebase:', error);
        }
    }

    // Convenience methods for different log levels
    debug(message, data = null, userId = null) {
        return this.log(Logger.LEVELS.DEBUG, message, data, userId);
    }

    info(message, data = null, userId = null) {
        return this.log(Logger.LEVELS.INFO, message, data, userId);
    }

    warn(message, data = null, userId = null) {
        return this.log(Logger.LEVELS.WARN, message, data, userId);
    }

    error(message, data = null, userId = null) {
        return this.log(Logger.LEVELS.ERROR, message, data, userId);
    }

    critical(message, data = null, userId = null) {
        return this.log(Logger.LEVELS.CRITICAL, message, data, userId);
    }

    // User action logging
    logUserAction(action, details = null, userId = null) {
        return this.info(`User Action: ${action}`, details, userId);
    }

    // Authentication logging
    logAuth(action, userId = null, details = null) {
        return this.info(`Auth: ${action}`, details, userId);
    }

    // Database operation logging
    logDatabase(operation, collection, documentId = null, details = null) {
        return this.info(`Database: ${operation} on ${collection}`, {
            documentId,
            details
        });
    }

    // Error logging with stack trace
    logError(error, context = '', userId = null) {
        const errorDetails = {
            message: error.message,
            stack: error.stack,
            context,
            name: error.name
        };
        
        return this.error(`Error in ${context}: ${error.message}`, errorDetails, userId);
    }

    // Performance logging
    logPerformance(operation, duration, details = null) {
        return this.info(`Performance: ${operation} took ${duration}ms`, details);
    }

    // Get logs from memory
    getLogs(level = null, limit = 100) {
        let filteredLogs = this.logs;
        
        if (level !== null) {
            filteredLogs = this.logs.filter(log => log.level === Object.keys(Logger.LEVELS)[level]);
        }
        
        return filteredLogs.slice(-limit);
    }

    // Get logs from localStorage
    getStoredLogs() {
        try {
            return JSON.parse(localStorage.getItem('appLogs') || '[]');
        } catch (error) {
            console.error('Failed to retrieve stored logs:', error);
            return [];
        }
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('appLogs');
        this.info('Logs cleared');
    }

    // Export logs as JSON
    exportLogs() {
        const allLogs = {
            memoryLogs: this.logs,
            storedLogs: this.getStoredLogs(),
            exportedAt: this.formatTimestamp(),
            sessionId: this.getSessionId()
        };
        
        return JSON.stringify(allLogs, null, 2);
    }

    // Download logs as file
    downloadLogs() {
        const logsData = this.exportLogs();
        const blob = new Blob([logsData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-logs-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.info('Logs downloaded');
    }

    // Monitor unhandled errors
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            this.logError(event.error, 'Global Error Handler');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled Promise Rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });

        this.info('Global error handling setup complete');
    }

    // Monitor user interactions
    setupUserInteractionLogging() {
        // Log page loads
        window.addEventListener('load', () => {
            this.logUserAction('Page Load', { url: window.location.href });
        });

        // Log page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.logUserAction('Visibility Change', { 
                hidden: document.hidden,
                visibilityState: document.visibilityState 
            });
        });

        // Log beforeunload
        window.addEventListener('beforeunload', () => {
            this.logUserAction('Page Unload', { url: window.location.href });
        });

        this.info('User interaction logging setup complete');
    }
}

// Create global logger instance
const logger = new Logger();

// Setup global error handling and user interaction logging
logger.setupGlobalErrorHandling();
logger.setupUserInteractionLogging();

// Log application start
logger.info('Application Logger Initialized', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
});

// Make logger available globally
window.logger = logger;
