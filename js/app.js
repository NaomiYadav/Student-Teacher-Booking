// Main Application Module - Fixed Version
// Note: logger and db are now available globally

class AppManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.initializeApp();
    }

    // Initialize the application
    async initializeApp() {
        try {
            logger.info('Application initialization started');
            this.setupGlobalEventListeners();
            logger.info('Application initialization completed');
        } catch (error) {
            logger.logError(error, 'Application initialization');
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Setup notification close handlers
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeNotification') {
                const notification = document.getElementById('notification');
                if (notification) {
                    notification.classList.remove('show');
                }
            }
        });

        // Make admin functions globally available
        this.setupAdminFunctions();
    }

    // Setup admin functions
    setupAdminFunctions() {
        // Approve teacher function
        window.approveTeacher = async (teacherId) => {
            try {
                await db.doc('users', teacherId).update({ status: 'approved' });
                this.showNotification('Teacher approved successfully', 'success');
                
                // Refresh the admin dashboard if it's currently shown
                const adminDashboard = document.getElementById('adminDashboard');
                if (adminDashboard) {
                    location.reload(); // Simple refresh for now
                }
                
                logger.info('Teacher approved', { teacherId });
            } catch (error) {
                this.showNotification('Error approving teacher', 'error');
                logger.logError(error, 'Approving teacher', teacherId);
            }
        };

        // Edit user function
        window.editUser = (userId) => {
            this.showNotification('Edit functionality coming soon', 'info');
            logger.info('Edit user requested', { userId });
        };

        // Delete user function
        window.deleteUser = async (userId) => {
            if (confirm('Are you sure you want to delete this user?')) {
                try {
                    await db.doc('users', userId).delete();
                    this.showNotification('User deleted successfully', 'success');
                    
                    // Refresh the admin dashboard
                    const adminDashboard = document.getElementById('adminDashboard');
                    if (adminDashboard) {
                        location.reload(); // Simple refresh for now
                    }
                    
                    logger.info('User deleted', { userId });
                } catch (error) {
                    this.showNotification('Error deleting user', 'error');
                    logger.logError(error, 'Deleting user', userId);
                }
            }
        };
    }

    // Show notification helper
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notificationMessage');
        
        if (notification && messageElement) {
            messageElement.textContent = message;
            notification.className = `notification ${type} show`;
            
            logger.info('Notification shown', { message, type });
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
    }
}

// Initialize app manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing App Manager...');
    window.appManagerInstance = new AppManager();
});

// Make AppManager available globally
window.AppManager = AppManager;
