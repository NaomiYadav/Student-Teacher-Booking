// Authentication Module - Fixed Version
import { auth, db, useMockFirebase } from './firebase-config.js';
import logger from './logger.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.usingMockAuth = true; // Always use mock for stability
        
        console.log(`🔧 Auth Manager initialized - Using Mock Firebase for stability`);
        this.showNotification('Running in demo mode - Data will be stored locally', 'info');
        
        this.setupAuthStateListener();
        this.setupEventListeners();
    }

    // Setup authentication state listener
    setupAuthStateListener() {
            // Use mock auth state listener
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    this.currentUser = user;
                    await this.loadUserRole();
                    logger.logAuth('Mock user signed in', user.uid, { email: user.email });
                    this.redirectToDashboard();
                } else {
                    this.currentUser = null;
                    this.userRole = null;
                    logger.logAuth('Mock user signed out');
                    this.showLandingPage();
                }
            });
        } else {
            // Use real Firebase auth state listener
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    this.currentUser = user;
                    await this.loadUserRole();
                    logger.logAuth('User signed in', user.uid, { email: user.email });
                    this.redirectToDashboard();
                } else {
                    this.currentUser = null;
                    this.userRole = null;
                    logger.logAuth('User signed out');
                    this.showLandingPage();
                }
            });
        }
    }

    // Load user role from Firestore
    async loadUserRole() {
        try {
            if (this.currentUser) {
                let userDoc;
                
                if (this.usingMockAuth) {
                    userDoc = await mockGetDoc(mockDoc(db, 'users', this.currentUser.uid));
                } else {
                    userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
                }
                
                if (userDoc.exists || (userDoc.exists && userDoc.exists())) {
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
        // Login buttons
        document.querySelectorAll('#loginBtn, #heroLoginBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        });

        // Register buttons
        document.querySelectorAll('#registerBtn, #heroRegisterBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegister();
            });
        });

        // Switch between login and register
        const switchToRegister = document.getElementById('switchToRegister');
        const switchToLogin = document.getElementById('switchToLogin');
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegister();
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        }
    }

    // Toggle conditional fields based on role selection
    toggleConditionalFields() {
        const roleSelect = document.getElementById('registerRole');
        const studentFields = document.getElementById('studentFields');
        const teacherFields = document.getElementById('teacherFields');
        
        if (roleSelect && studentFields && teacherFields) {
            const selectedRole = roleSelect.value;
            
            studentFields.classList.remove('active');
            teacherFields.classList.remove('active');
            
            if (selectedRole === 'student') {
                studentFields.classList.add('active');
                // Make student fields required
                document.getElementById('studentId').required = true;
                document.getElementById('studentYear').required = true;
                // Make teacher fields optional
                document.getElementById('teacherDepartment').required = false;
                document.getElementById('teacherSubject').required = false;
            } else if (selectedRole === 'teacher') {
                teacherFields.classList.add('active');
                // Make teacher fields required
                document.getElementById('teacherDepartment').required = true;
                document.getElementById('teacherSubject').required = true;
                // Make student fields optional
                document.getElementById('studentId').required = false;
                document.getElementById('studentYear').required = false;
            }
            
            logger.logUserAction('Role selection changed', { role: selectedRole });
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
            console.log('🔐 Attempting Firebase authentication...');
            logger.logUserAction('Registration attempt', { 
                email: formData.email, 
                role: formData.role 
            });
            
            // Create user account using mock auth
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
            
            console.log('💾 Saving user data to Firestore...');
            console.log('User data to save:', userData);
            
            // Save user data to Firestore
            await db.doc('users', user.uid).set(userData);
                console.log('✅ User data saved successfully to mock Firestore');
            } else {
                await setDoc(doc(db, 'users', user.uid), userData);
                console.log('✅ User data saved successfully to Firestore');
            }
            
            logger.logAuth('Registration successful', user.uid, { role: formData.role });
            logger.logDatabase('CREATE', 'users', user.uid, userData);
            
            if (formData.role === 'teacher') {
                this.showNotification('Registration successful! Your account is pending admin approval.', 'success');
                console.log('📧 Teacher account created - requires admin approval');
                
                // Sign out teacher until approved
                if (this.usingMockAuth) {
                    await mockSignOut(auth);
                } else {
                    await signOut(auth);
                }
                this.showLogin();
            } else {
                this.showNotification('Registration successful! Welcome!', 'success');
                console.log('🎉 Registration completed successfully');
            }
            
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
            studentId: document.getElementById('studentId')?.value || '',
            studentYear: document.getElementById('studentYear')?.value || '',
            teacherDepartment: document.getElementById('teacherDepartment')?.value || '',
            teacherSubject: document.getElementById('teacherSubject')?.value || '',
            teacherOfficeHours: document.getElementById('teacherOfficeHours')?.value || ''
        };
    }

    // Validate registration data
    validateRegistrationData(data) {
        console.log('Validating registration data:', data);
        
        if (!data.name || data.name.trim().length === 0) {
            this.showNotification('Please enter your full name', 'error');
            return false;
        }
        
        if (!data.email || data.email.trim().length === 0) {
            this.showNotification('Please enter your email address', 'error');
            return false;
        }
        
        if (!data.password || data.password.length === 0) {
            this.showNotification('Please enter a password', 'error');
            return false;
        }
        
        if (!data.role || data.role.trim().length === 0) {
            this.showNotification('Please select your role', 'error');
            return false;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        if (data.password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return false;
        }
        
        if (data.role === 'student') {
            if (!data.studentId || data.studentId.trim().length === 0) {
                this.showNotification('Please enter your Student ID', 'error');
                return false;
            }
            if (!data.studentYear || data.studentYear.trim().length === 0) {
                this.showNotification('Please select your Year of Study', 'error');
                return false;
            }
        }
        
        if (data.role === 'teacher') {
            if (!data.teacherDepartment || data.teacherDepartment.trim().length === 0) {
                this.showNotification('Please select your Department', 'error');
                return false;
            }
            if (!data.teacherSubject || data.teacherSubject.trim().length === 0) {
                this.showNotification('Please enter your Subject/Specialization', 'error');
                return false;
            }
        }
        
        console.log('✅ Validation passed');
        return true;
    }

    // Handle authentication errors
    handleAuthError(error) {
        let message = 'An error occurred. Please try again.';
        
        // Log the full error for debugging
        console.error('Authentication Error:', error);
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password';
                break;
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak (minimum 6 characters)';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed attempts. Please try again later';
                break;
            case 'auth/network-request-failed':
                message = 'Network error. Please check your internet connection.';
                break;
            case 'auth/invalid-api-key':
                message = 'Firebase configuration error. Please check the setup.';
                break;
            case 'auth/app-not-authorized':
                message = 'App not authorized. Please check Firebase configuration.';
                break;
            default:
                if (error.message.includes('Firebase')) {
                    message = `Firebase Error: ${error.message}. Please check your configuration.`;
                } else {
                    message = `Error: ${error.message}`;
                }
                break;
        }
        
        this.showNotification(message, 'error');
        logger.error('Auth error', { code: error.code, message: error.message });
    }

    // Sign out user
    async logout() {
        try {
            logger.logAuth('Logout attempt', this.currentUser?.uid);
            
            if (this.usingMockAuth) {
                await mockSignOut(auth);
            } else {
                await signOut(auth);
            }
            
            this.showNotification('Logged out successfully', 'success');
            logger.logAuth('Logout successful');
        } catch (error) {
            logger.logError(error, 'User logout');
            this.showNotification('Error logging out', 'error');
        }
    }

    // Show different pages
    showLandingPage() {
        this.hideAllSections();
        document.getElementById('landingPage').classList.add('active');
        logger.logUserAction('Landing page shown');
    }

    showLogin() {
        this.hideAllSections();
        document.getElementById('loginPage').classList.add('active');
        logger.logUserAction('Login page shown');
    }

    showRegister() {
        this.hideAllSections();
        document.getElementById('registerPage').classList.add('active');
        logger.logUserAction('Register page shown');
    }

    // Redirect to appropriate dashboard
    redirectToDashboard() {
        if (this.currentUser && this.userRole) {
            this.hideAllSections();
            this.loadDashboard(this.userRole);
            logger.logUserAction('Dashboard loaded', { role: this.userRole });
        }
    }

    // Load role-specific dashboard
    async loadDashboard(role) {
        const dashboardContainer = document.getElementById('dashboardContainer');
        
        try {
            let dashboardHTML = '';
            
            switch (role) {
                case 'admin':
                    dashboardHTML = await this.getAdminDashboard();
                    break;
                case 'teacher':
                    dashboardHTML = await this.getTeacherDashboard();
                    break;
                case 'student':
                    dashboardHTML = await this.getStudentDashboard();
                    break;
                default:
                    throw new Error('Invalid role');
            }
            
            dashboardContainer.innerHTML = dashboardHTML;
            this.setupDashboardEventListeners(role);
            
        } catch (error) {
            logger.logError(error, 'Loading dashboard', this.currentUser.uid);
            this.showNotification('Error loading dashboard', 'error');
        }
    }

    // Get admin dashboard HTML
    async getAdminDashboard() {
        return `
            <div class="dashboard section active">
                <div class="dashboard-header">
                    <h2><i class="fas fa-user-shield"></i> Admin Dashboard</h2>
                    <button class="btn btn-danger" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <nav class="dashboard-nav">
                    <button class="dashboard-nav-item active" data-section="teachers">
                        <i class="fas fa-chalkboard-teacher"></i> Manage Teachers
                    </button>
                    <button class="dashboard-nav-item" data-section="students">
                        <i class="fas fa-user-graduate"></i> Manage Students
                    </button>
                    <button class="dashboard-nav-item" data-section="appointments">
                        <i class="fas fa-calendar"></i> All Appointments
                    </button>
                    <button class="dashboard-nav-item" data-section="logs">
                        <i class="fas fa-list"></i> System Logs
                    </button>
                </nav>
                
                <div class="dashboard-content">
                    <div id="teachers" class="dashboard-section active">
                        <div class="section-header">
                            <h3>Teacher Management</h3>
                            <button class="btn btn-primary" id="addTeacherBtn">
                                <i class="fas fa-plus"></i> Add Teacher
                            </button>
                        </div>
                        <div id="teachersTable"></div>
                    </div>
                    
                    <div id="students" class="dashboard-section">
                        <div class="section-header">
                            <h3>Student Management</h3>
                        </div>
                        <div id="studentsTable"></div>
                    </div>
                    
                    <div id="appointments" class="dashboard-section">
                        <div class="section-header">
                            <h3>All Appointments</h3>
                        </div>
                        <div id="appointmentsTable"></div>
                    </div>
                    
                    <div id="logs" class="dashboard-section">
                        <div class="section-header">
                            <h3>System Logs</h3>
                            <button class="btn btn-secondary" id="downloadLogsBtn">
                                <i class="fas fa-download"></i> Download Logs
                            </button>
                        </div>
                        <div id="logsTable"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Get teacher dashboard HTML
    async getTeacherDashboard() {
        return `
            <div class="dashboard section active">
                <div class="dashboard-header">
                    <h2><i class="fas fa-chalkboard-teacher"></i> Teacher Dashboard</h2>
                    <button class="btn btn-danger" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <nav class="dashboard-nav">
                    <button class="dashboard-nav-item active" data-section="schedule">
                        <i class="fas fa-calendar"></i> My Schedule
                    </button>
                    <button class="dashboard-nav-item" data-section="appointments">
                        <i class="fas fa-calendar-check"></i> Appointments
                    </button>
                    <button class="dashboard-nav-item" data-section="messages">
                        <i class="fas fa-envelope"></i> Messages
                    </button>
                    <button class="dashboard-nav-item" data-section="profile">
                        <i class="fas fa-user"></i> Profile
                    </button>
                </nav>
                
                <div class="dashboard-content">
                    <div id="schedule" class="dashboard-section active">
                        <div class="section-header">
                            <h3>My Schedule</h3>
                            <button class="btn btn-primary" id="setAvailabilityBtn">
                                <i class="fas fa-clock"></i> Set Availability
                            </button>
                        </div>
                        <div id="scheduleView"></div>
                    </div>
                    
                    <div id="appointments" class="dashboard-section">
                        <div class="section-header">
                            <h3>Appointment Requests</h3>
                        </div>
                        <div id="appointmentRequests"></div>
                    </div>
                    
                    <div id="messages" class="dashboard-section">
                        <div class="section-header">
                            <h3>Messages from Students</h3>
                        </div>
                        <div id="messagesView"></div>
                    </div>
                    
                    <div id="profile" class="dashboard-section">
                        <div class="section-header">
                            <h3>My Profile</h3>
                        </div>
                        <div id="profileView"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Get student dashboard HTML
    async getStudentDashboard() {
        return `
            <div class="dashboard section active">
                <div class="dashboard-header">
                    <h2><i class="fas fa-user-graduate"></i> Student Dashboard</h2>
                    <button class="btn btn-danger" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
                
                <nav class="dashboard-nav">
                    <button class="dashboard-nav-item active" data-section="search">
                        <i class="fas fa-search"></i> Find Teachers
                    </button>
                    <button class="dashboard-nav-item" data-section="appointments">
                        <i class="fas fa-calendar"></i> My Appointments
                    </button>
                    <button class="dashboard-nav-item" data-section="messages">
                        <i class="fas fa-envelope"></i> Messages
                    </button>
                    <button class="dashboard-nav-item" data-section="profile">
                        <i class="fas fa-user"></i> Profile
                    </button>
                </nav>
                
                <div class="dashboard-content">
                    <div id="search" class="dashboard-section active">
                        <div class="section-header">
                            <h3>Find Teachers</h3>
                        </div>
                        <div class="search-filter-container">
                            <input type="text" id="teacherSearch" class="form-control search-input" 
                                   placeholder="Search by name or subject...">
                            <select id="departmentFilter" class="form-control filter-select">
                                <option value="">All Departments</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="English">English</option>
                                <option value="History">History</option>
                            </select>
                        </div>
                        <div id="teachersGrid"></div>
                    </div>
                    
                    <div id="appointments" class="dashboard-section">
                        <div class="section-header">
                            <h3>My Appointments</h3>
                        </div>
                        <div id="myAppointments"></div>
                    </div>
                    
                    <div id="messages" class="dashboard-section">
                        <div class="section-header">
                            <h3>Messages</h3>
                            <button class="btn btn-primary" id="composeMessageBtn">
                                <i class="fas fa-plus"></i> New Message
                            </button>
                        </div>
                        <div id="messagesView"></div>
                    </div>
                    
                    <div id="profile" class="dashboard-section">
                        <div class="section-header">
                            <h3>My Profile</h3>
                        </div>
                        <div id="profileView"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // Setup dashboard event listeners
    setupDashboardEventListeners(role) {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Dashboard navigation
        const navItems = document.querySelectorAll('.dashboard-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.getAttribute('data-section');
                this.switchDashboardSection(section);
            });
        });

        // Role-specific event listeners
        switch (role) {
            case 'admin':
                this.setupAdminEventListeners();
                break;
            case 'teacher':
                this.setupTeacherEventListeners();
                break;
            case 'student':
                this.setupStudentEventListeners();
                break;
        }
    }

    // Switch dashboard section
    switchDashboardSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.dashboard-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');

        logger.logUserAction('Dashboard section switched', { section: sectionName });
    }

    // Setup admin-specific event listeners
    setupAdminEventListeners() {
        // Implementation will be added in admin module
    }

    // Setup teacher-specific event listeners
    setupTeacherEventListeners() {
        // Implementation will be added in teacher module
    }

    // Setup student-specific event listeners
    setupStudentEventListeners() {
        // Implementation will be added in student module
    }

    // Utility functions
    hideAllSections() {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.classList.toggle('active', show);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notificationMessage');
        
        if (notification && messageElement) {
            messageElement.textContent = message;
            notification.className = `notification ${type} show`;
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
            }, 5000);
        }
        
        logger.info('Notification shown', { message, type });
    }

    // Get current user info
    getCurrentUser() {
        return {
            user: this.currentUser,
            role: this.userRole
        };
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Check user role
    hasRole(role) {
        return this.userRole === role;
    }
}

// Create global auth manager instance
const authManager = new AuthManager();

// Setup close notification handler
document.getElementById('closeNotification')?.addEventListener('click', () => {
    document.getElementById('notification').classList.remove('show');
});

export default authManager;
