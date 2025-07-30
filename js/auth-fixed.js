// Authentication Module - Fixed Version
import { auth, db } from './firebase-config.js';
import logger from './logger.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        
        console.log('🔧 Auth Manager initialized - Using Mock Firebase for stability');
        this.showNotification('Running in demo mode - Data will be stored locally', 'info');
        
        this.setupAuthStateListener();
        this.setupEventListeners();
    }

    // Setup authentication state listener
    setupAuthStateListener() {
        auth.onAuthStateChanged((user) => {
            console.log('🔄 Auth state changed:', user ? `Signed in as ${user.email}` : 'Signed out');
            this.currentUser = user;
            
            if (user) {
                this.loadUserRole().then(() => {
                    this.redirectToDashboard();
                });
            } else {
                this.userRole = null;
                this.showLandingPage();
            }
        });
    }

    // Load user role from database
    async loadUserRole() {
        try {
            if (this.currentUser) {
                const userDoc = await db.doc('users', this.currentUser.uid).get();
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    this.userRole = userData.role;
                    logger.info('User role loaded', { role: this.userRole, userId: this.currentUser.uid });
                }
            }
        } catch (error) {
            logger.logError(error, 'Loading user role', this.currentUser?.uid);
        }
    }

    // Setup event listeners for auth forms
    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Role selection for conditional fields
        const registerRole = document.getElementById('registerRole');
        if (registerRole) {
            registerRole.addEventListener('change', this.toggleConditionalFields);
        }

        // Navigation links
        this.setupNavigationListeners();
    }

    // Setup navigation event listeners
    setupNavigationListeners() {
        // Login/Register button clicks
        document.getElementById('loginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        document.getElementById('registerBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        document.getElementById('heroLoginBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        document.getElementById('heroRegisterBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        // Switch between login and register
        document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });
    }

    // Toggle conditional fields based on role
    toggleConditionalFields() {
        const role = document.getElementById('registerRole').value;
        const studentFields = document.getElementById('studentFields');
        const teacherFields = document.getElementById('teacherFields');

        // Hide all conditional fields first
        if (studentFields) studentFields.style.display = 'none';
        if (teacherFields) teacherFields.style.display = 'none';

        // Show relevant fields
        if (role === 'student' && studentFields) {
            studentFields.style.display = 'block';
        } else if (role === 'teacher' && teacherFields) {
            teacherFields.style.display = 'block';
        }
    }

    // Handle user login
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;

        if (!email || !password || !role) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        this.showLoading(true);
        
        try {
            logger.logUserAction('Login attempt', { email, role });
            
            // Sign in using mock auth
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Verify role matches
            const userDoc = await db.doc('users', user.uid).get();
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                
                if (userData.role !== role) {
                    await auth.signOut();
                    this.showNotification('Invalid role selected', 'error');
                    logger.warn('Role mismatch during login', { 
                        expectedRole: role, 
                        actualRole: userData.role,
                        userId: user.uid 
                    });
                    return;
                }
                
                // Check if teacher registration is approved
                if (role === 'teacher' && userData.status !== 'approved') {
                    await auth.signOut();
                    this.showNotification('Your teacher account is pending approval', 'warning');
                    logger.info('Teacher login attempted with pending approval', { userId: user.uid });
                    return;
                }
                
                this.showNotification('Login successful', 'success');
                logger.logAuth('Login successful', user.uid, { role: userData.role });
                
            } else {
                await auth.signOut();
                this.showNotification('User data not found', 'error');
                logger.error('User document not found after login', null, user.uid);
            }
            
        } catch (error) {
            logger.logError(error, 'User login');
            this.handleAuthError(error);
        } finally {
            this.showLoading(false);
        }
    }

    // Handle user registration
    async handleRegister(e) {
        e.preventDefault();
        
        console.log('🚀 Starting registration process...');
        
        const formData = this.getRegistrationFormData();
        console.log('📝 Form data collected:', formData);
        
        if (!this.validateRegistrationData(formData)) {
            console.log('❌ Validation failed');
            return;
        }
        
        this.showLoading(true);
        
        try {
            console.log('🔐 Attempting user creation...');
            logger.logUserAction('Registration attempt', { 
                email: formData.email, 
                role: formData.role 
            });
            
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(formData.email, formData.password);
            console.log('✅ User account created successfully:', userCredential.user.uid);
            
            const user = userCredential.user;
            
            // Prepare user data
            const userData = {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                role: formData.role,
                createdAt: new Date().toISOString(),
                status: formData.role === 'teacher' ? 'pending' : 'approved'
            };
            
            // Add role-specific data
            if (formData.role === 'student') {
                userData.studentId = formData.studentId;
                userData.yearOfStudy = formData.studentYear;
                console.log('👨‍🎓 Added student-specific data');
            } else if (formData.role === 'teacher') {
                userData.department = formData.teacherDepartment;
                userData.subject = formData.teacherSubject;
                userData.officeHours = formData.teacherOfficeHours;
                console.log('👨‍🏫 Added teacher-specific data');
            }
            
            console.log('💾 Saving user data...');
            
            // Save user data to database
            await db.doc('users', user.uid).set(userData);
            console.log('✅ User data saved successfully');
            
            // Sign out the user immediately (they need to login properly)
            await auth.signOut();
            console.log('👋 User signed out - they can now login');
            
            // Show appropriate success message
            let message = 'Registration successful! You can now login.';
            if (formData.role === 'teacher') {
                message = 'Teacher registration submitted! Please wait for admin approval.';
            }
            
            this.showNotification(message, 'success');
            logger.logAuth('Registration completed', user.uid, { role: formData.role });
            
            // Switch to login page
            setTimeout(() => {
                this.showLogin();
            }, 2000);
            
        } catch (error) {
            console.error('❌ Registration failed:', error);
            logger.logError(error, 'User registration');
            this.handleAuthError(error);
        } finally {
            this.showLoading(false);
        }
    }

    // Get registration form data
    getRegistrationFormData() {
        return {
            name: document.getElementById('registerName').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            role: document.getElementById('registerRole').value,
            studentId: document.getElementById('studentId')?.value,
            studentYear: document.getElementById('studentYear')?.value,
            teacherDepartment: document.getElementById('teacherDepartment')?.value,
            teacherSubject: document.getElementById('teacherSubject')?.value,
            teacherOfficeHours: document.getElementById('teacherOfficeHours')?.value
        };
    }

    // Validate registration data
    validateRegistrationData(data) {
        if (!data.name || !data.email || !data.password || !data.role) {
            this.showNotification('Please fill in all required fields', 'error');
            return false;
        }

        if (data.password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return false;
        }

        // Role-specific validation
        if (data.role === 'student') {
            if (!data.studentId || !data.studentYear) {
                this.showNotification('Please fill in all student fields', 'error');
                return false;
            }
        } else if (data.role === 'teacher') {
            if (!data.teacherDepartment || !data.teacherSubject) {
                this.showNotification('Please fill in all teacher fields', 'error');
                return false;
            }
        }

        return true;
    }

    // Handle authentication errors
    handleAuthError(error) {
        let message = 'An error occurred. Please try again.';
        
        if (error.message.includes('email-already-in-use')) {
            message = 'An account with this email already exists';
        } else if (error.message.includes('weak-password')) {
            message = 'Password is too weak';
        } else if (error.message.includes('invalid-email')) {
            message = 'Invalid email address';
        } else if (error.message.includes('user-not-found') || error.message.includes('wrong-password')) {
            message = 'Invalid email or password';
        }
        
        this.showNotification(message, 'error');
    }

    // Logout user
    async logout() {
        try {
            await auth.signOut();
            this.showNotification('Logged out successfully', 'success');
            logger.logAuth('User logged out', this.currentUser?.uid);
        } catch (error) {
            logger.logError(error, 'User logout');
            this.showNotification('Error logging out', 'error');
        }
    }

    // Show landing page
    showLandingPage() {
        this.hideAllSections();
        document.getElementById('landingPage')?.classList.add('active');
        logger.logUserAction('Landing page shown');
    }

    // Show login page
    showLogin() {
        this.hideAllSections();
        document.getElementById('loginPage')?.classList.add('active');
        logger.logUserAction('Login page shown');
    }

    // Show register page
    showRegister() {
        this.hideAllSections();
        document.getElementById('registerPage')?.classList.add('active');
        this.toggleConditionalFields(); // Set up initial field visibility
        logger.logUserAction('Register page shown');
    }

    // Redirect to appropriate dashboard
    redirectToDashboard() {
        if (this.currentUser && this.userRole) {
            this.loadDashboard(this.userRole);
        }
    }

    // Load dashboard based on role
    async loadDashboard(role) {
        this.hideAllSections();
        
        let dashboardHTML = '';
        
        if (role === 'admin') {
            dashboardHTML = await this.getAdminDashboard();
        } else if (role === 'teacher') {
            dashboardHTML = await this.getTeacherDashboard();
        } else if (role === 'student') {
            dashboardHTML = await this.getStudentDashboard();
        }
        
        const container = document.getElementById('dashboardContainer');
        if (container) {
            container.innerHTML = dashboardHTML;
            container.style.display = 'block';
            this.setupDashboardEventListeners(role);
        }
        
        logger.logUserAction('Dashboard loaded', { role });
    }

    // Get admin dashboard HTML
    async getAdminDashboard() {
        try {
            // Get all users for admin management
            const usersSnapshot = await db.collection('users').get();
            const users = usersSnapshot.docs.map(doc => doc.data());
            
            const pendingTeachers = users.filter(u => u.role === 'teacher' && u.status === 'pending');
            const approvedTeachers = users.filter(u => u.role === 'teacher' && u.status === 'approved');
            const students = users.filter(u => u.role === 'student');
            
            return `
                <section id="adminDashboard" class="section active">
                    <div class="dashboard-header">
                        <h2><i class="fas fa-tachometer-alt"></i> Admin Dashboard</h2>
                        <button id="logoutBtn" class="btn btn-secondary">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                    
                    <div class="dashboard-stats">
                        <div class="stat-card">
                            <i class="fas fa-users"></i>
                            <h3>${users.length}</h3>
                            <p>Total Users</p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-chalkboard-teacher"></i>
                            <h3>${approvedTeachers.length}</h3>
                            <p>Active Teachers</p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-graduate"></i>
                            <h3>${students.length}</h3>
                            <p>Students</p>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-clock"></i>
                            <h3>${pendingTeachers.length}</h3>
                            <p>Pending Approvals</p>
                        </div>
                    </div>
                    
                    <div class="dashboard-content">
                        <div class="admin-section">
                            <h3><i class="fas fa-user-check"></i> Teacher Approvals</h3>
                            <div class="teacher-approvals">
                                ${pendingTeachers.length > 0 ? 
                                    pendingTeachers.map(teacher => `
                                        <div class="teacher-card pending">
                                            <h4>${teacher.name}</h4>
                                            <p><strong>Email:</strong> ${teacher.email}</p>
                                            <p><strong>Department:</strong> ${teacher.department}</p>
                                            <p><strong>Subject:</strong> ${teacher.subject}</p>
                                            <p><strong>Status:</strong> <span class="status pending">Pending</span></p>
                                            <button onclick="approveTeacher('${teacher.uid}')" class="btn btn-success">
                                                <i class="fas fa-check"></i> Approve
                                            </button>
                                        </div>
                                    `).join('') 
                                    : '<p class="no-data">No pending teacher approvals</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="admin-section">
                            <h3><i class="fas fa-chalkboard-teacher"></i> All Teachers</h3>
                            <div class="teachers-list">
                                ${approvedTeachers.length > 0 ? `
                                    <table class="data-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Department</th>
                                                <th>Subject</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${approvedTeachers.map(teacher => `
                                                <tr>
                                                    <td>${teacher.name}</td>
                                                    <td>${teacher.email}</td>
                                                    <td>${teacher.department}</td>
                                                    <td>${teacher.subject}</td>
                                                    <td><span class="status approved">Approved</span></td>
                                                    <td>
                                                        <button onclick="editUser('${teacher.uid}')" class="btn btn-sm btn-secondary">
                                                            <i class="fas fa-edit"></i>
                                                        </button>
                                                        <button onclick="deleteUser('${teacher.uid}')" class="btn btn-sm btn-danger">
                                                            <i class="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                ` : '<p class="no-data">No approved teachers found</p>'}
                            </div>
                        </div>
                    </div>
                </section>
            `;
        } catch (error) {
            logger.logError(error, 'Loading admin dashboard');
            return '<div class="error">Error loading admin dashboard</div>';
        }
    }

    // Get teacher dashboard HTML
    async getTeacherDashboard() {
        return `
            <section id="teacherDashboard" class="section active">
                <div class="dashboard-header">
                    <h2><i class="fas fa-chalkboard-teacher"></i> Teacher Dashboard</h2>
                    <button id="logoutBtn" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <div class="dashboard-content">
                    <div class="teacher-welcome">
                        <h3>Welcome, ${this.currentUser?.email}</h3>
                        <p>Manage your availability and appointments</p>
                    </div>
                    
                    <div class="teacher-sections">
                        <div class="section-card">
                            <i class="fas fa-calendar-alt"></i>
                            <h4>Manage Availability</h4>
                            <p>Set your available time slots</p>
                            <button class="btn btn-primary">Set Availability</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-calendar-check"></i>
                            <h4>View Appointments</h4>
                            <p>See your scheduled meetings</p>
                            <button class="btn btn-primary">View Appointments</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-user-edit"></i>
                            <h4>Update Profile</h4>
                            <p>Edit your information</p>
                            <button class="btn btn-primary">Edit Profile</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Get student dashboard HTML
    async getStudentDashboard() {
        return `
            <section id="studentDashboard" class="section active">
                <div class="dashboard-header">
                    <h2><i class="fas fa-user-graduate"></i> Student Dashboard</h2>
                    <button id="logoutBtn" class="btn btn-secondary">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <div class="dashboard-content">
                    <div class="student-welcome">
                        <h3>Welcome, ${this.currentUser?.email}</h3>
                        <p>Book appointments with your teachers</p>
                    </div>
                    
                    <div class="student-sections">
                        <div class="section-card">
                            <i class="fas fa-search"></i>
                            <h4>Find Teachers</h4>
                            <p>Search for teachers by subject</p>
                            <button class="btn btn-primary">Search Teachers</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-calendar-plus"></i>
                            <h4>Book Appointment</h4>
                            <p>Schedule a meeting</p>
                            <button class="btn btn-primary">Book Now</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-calendar-check"></i>
                            <h4>My Appointments</h4>
                            <p>View your scheduled meetings</p>
                            <button class="btn btn-primary">View Appointments</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // Setup dashboard event listeners
    setupDashboardEventListeners(role) {
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Make functions globally available for onclick handlers
        if (role === 'admin') {
            window.approveTeacher = async (teacherId) => {
                try {
                    await db.doc('users', teacherId).update({ status: 'approved' });
                    this.showNotification('Teacher approved successfully', 'success');
                    this.loadDashboard('admin'); // Refresh dashboard
                } catch (error) {
                    this.showNotification('Error approving teacher', 'error');
                    logger.logError(error, 'Approving teacher');
                }
            };

            window.editUser = (userId) => {
                this.showNotification('Edit functionality coming soon', 'info');
            };

            window.deleteUser = async (userId) => {
                if (confirm('Are you sure you want to delete this user?')) {
                    try {
                        await db.doc('users', userId).delete();
                        this.showNotification('User deleted successfully', 'success');
                        this.loadDashboard('admin'); // Refresh dashboard
                    } catch (error) {
                        this.showNotification('Error deleting user', 'error');
                        logger.logError(error, 'Deleting user');
                    }
                }
            };
        }
    }

    // Hide all sections
    hideAllSections() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => section.classList.remove('active'));
        
        const dashboardContainer = document.getElementById('dashboardContainer');
        if (dashboardContainer) {
            dashboardContainer.style.display = 'none';
        }
    }

    // Show loading spinner
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.style.display = show ? 'flex' : 'none';
        }
    }

    // Show notification
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
        
        // Setup close button
        document.getElementById('closeNotification')?.addEventListener('click', () => {
            notification?.classList.remove('show');
        });
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Auth Manager...');
    new AuthManager();
});

export default AuthManager;
