// Authentication Module - Fixed Version
// Note: auth, db, and logger are now available globally

class AuthManager {
    constructor() {
        console.log('🔧 Auth Manager constructor called');
        this.currentUser = null;
        this.userRole = null;
        
        console.log('🔧 Auth Manager initialized - Using Mock Firebase for stability');
        this.showNotification('Running in demo mode - Data will be stored locally', 'info');
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            console.log('🔧 Setting up auth state listener and event listeners...');
            this.setupAuthStateListener();
            this.setupEventListeners();
            
            // Add a manual test
            this.testButtonFunctionality();
        }, 100);
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
        console.log('🔧 Setting up event listeners...');
        
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            console.log('✅ Login form found, adding event listener');
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        } else {
            console.log('❌ Login form not found');
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            console.log('✅ Register form found, adding event listener');
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        } else {
            console.log('❌ Register form not found');
        }

        // Role selection for conditional fields
        const registerRole = document.getElementById('registerRole');
        if (registerRole) {
            console.log('✅ Register role select found, adding event listener');
            registerRole.addEventListener('change', () => this.toggleConditionalFields());
        } else {
            console.log('❌ Register role select not found');
        }

        // Navigation links
        this.setupNavigationListeners();
    }

    // Setup navigation event listeners
    setupNavigationListeners() {
        console.log('🔧 Setting up navigation listeners...');
        
        // Login/Register button clicks
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            console.log('✅ Login button found, adding event listener');
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Login button clicked');
                this.showLogin();
            });
        } else {
            console.log('❌ Login button not found');
        }

        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            console.log('✅ Register button found, adding event listener');
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Register button clicked');
                this.showRegister();
            });
        } else {
            console.log('❌ Register button not found');
        }

        const heroLoginBtn = document.getElementById('heroLoginBtn');
        if (heroLoginBtn) {
            console.log('✅ Hero Login button found, adding event listener');
            heroLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Hero Login button clicked');
                this.showLogin();
            });
        } else {
            console.log('❌ Hero Login button not found');
        }

        const heroRegisterBtn = document.getElementById('heroRegisterBtn');
        if (heroRegisterBtn) {
            console.log('✅ Hero Register button found, adding event listener');
            heroRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Hero Register button clicked');
                this.showRegister();
            });
        } else {
            console.log('❌ Hero Register button not found');
        }

        // Switch between login and register
        const switchToRegister = document.getElementById('switchToRegister');
        if (switchToRegister) {
            console.log('✅ Switch to Register link found, adding event listener');
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Switch to Register clicked');
                this.showRegister();
            });
        }

        const switchToLogin = document.getElementById('switchToLogin');
        if (switchToLogin) {
            console.log('✅ Switch to Login link found, adding event listener');
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Switch to Login clicked');
                this.showLogin();
            });
        }
    }

    // Test button functionality
    testButtonFunctionality() {
        console.log('🧪 Testing button functionality...');
        
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const heroLoginBtn = document.getElementById('heroLoginBtn');
        const heroRegisterBtn = document.getElementById('heroRegisterBtn');
        
        console.log('🔍 Button elements found:');
        console.log('  - loginBtn:', !!loginBtn);
        console.log('  - registerBtn:', !!registerBtn);
        console.log('  - heroLoginBtn:', !!heroLoginBtn);
        console.log('  - heroRegisterBtn:', !!heroRegisterBtn);
        
        // Add a manual test button click after 3 seconds
        if (loginBtn) {
            setTimeout(() => {
                console.log('🧪 Simulating login button click...');
                loginBtn.click();
            }, 3000);
        }
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
                            <button id="searchTeachersBtn" class="btn btn-primary">Search Teachers</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-calendar-plus"></i>
                            <h4>Book Appointment</h4>
                            <p>Schedule a meeting</p>
                            <button id="bookAppointmentBtn" class="btn btn-primary">Book Now</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-calendar-check"></i>
                            <h4>My Appointments</h4>
                            <p>View your scheduled meetings</p>
                            <button id="viewAppointmentsBtn" class="btn btn-primary">View Appointments</button>
                        </div>
                    </div>
                    
                    <!-- Dynamic content area for student features -->
                    <div id="studentContent" style="margin-top: 30px;"></div>
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
        } else if (role === 'student') {
            // Student dashboard functionality
            console.log('🎯 Setting up student dashboard event listeners');
            
            const searchBtn = document.getElementById('searchTeachersBtn');
            const bookBtn = document.getElementById('bookAppointmentBtn');
            const viewBtn = document.getElementById('viewAppointmentsBtn');
            
            console.log('🔍 Found buttons:', { searchBtn: !!searchBtn, bookBtn: !!bookBtn, viewBtn: !!viewBtn });
            
            searchBtn?.addEventListener('click', async () => {
                console.log('🔍 Search Teachers button clicked');
                const contentDiv = document.getElementById('studentContent');
                if (!contentDiv) {
                    console.error('❌ Cannot find studentContent div');
                    return;
                }

                try {
                    console.log('🔄 Loading teachers...');
                    // Get all approved teachers
                    const usersSnapshot = await db.collection('users').get();
                    const teachers = usersSnapshot.docs
                        .map(doc => doc.data())
                        .filter(user => user.role === 'teacher' && user.status === 'approved');

                    console.log('👨‍🏫 Found teachers:', teachers.length);

                    // Create simple HTML content
                    const teachersHTML = teachers.map(teacher => `
                        <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0;">
                            <h4>${teacher.name}</h4>
                            <p><strong>Department:</strong> ${teacher.department}</p>
                            <p><strong>Subject:</strong> ${teacher.subject}</p>
                            <p><strong>Email:</strong> ${teacher.email}</p>
                            <button onclick="alert('Booking with ${teacher.name}')" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                Book Appointment
                            </button>
                        </div>
                    `).join('');

                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>🔍 Search Teachers</h3>
                            <div style="margin: 20px 0;">
                                ${teachers.length > 0 ? teachersHTML : '<p>No teachers found.</p>'}
                            </div>
                        </div>
                    `;

                    console.log('✅ Teachers displayed successfully');
                } catch (error) {
                    console.error('❌ Error loading teachers:', error);
                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>❌ Error</h3>
                            <p>Failed to load teachers. Please try again.</p>
                        </div>
                    `;
                }
            });

            bookBtn?.addEventListener('click', async () => {
                console.log('📅 Book Appointment button clicked');
                const contentDiv = document.getElementById('studentContent');
                if (!contentDiv) {
                    console.error('❌ Cannot find studentContent div');
                    return;
                }

                try {
                    // Get all approved teachers
                    const usersSnapshot = await db.collection('users').get();
                    const teachers = usersSnapshot.docs
                        .map(doc => doc.data())
                        .filter(user => user.role === 'teacher' && user.status === 'approved');

                    const teacherOptions = teachers.map(teacher => 
                        `<option value="${teacher.uid}">${teacher.name} - ${teacher.subject}</option>`
                    ).join('');

                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>📅 Book Appointment</h3>
                            <form id="simpleBookingForm" style="max-width: 500px;">
                                <div style="margin: 15px 0;">
                                    <label style="display: block; margin-bottom: 5px;">Select Teacher:</label>
                                    <select id="teacherSelect" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                        <option value="">Choose a teacher</option>
                                        ${teacherOptions}
                                    </select>
                                </div>
                                <div style="margin: 15px 0;">
                                    <label style="display: block; margin-bottom: 5px;">Date:</label>
                                    <input type="date" id="appointmentDate" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" min="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div style="margin: 15px 0;">
                                    <label style="display: block; margin-bottom: 5px;">Time:</label>
                                    <select id="appointmentTime" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                        <option value="">Select time</option>
                                        <option value="09:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="14:00">02:00 PM</option>
                                        <option value="15:00">03:00 PM</option>
                                        <option value="16:00">04:00 PM</option>
                                    </select>
                                </div>
                                <div style="margin: 15px 0;">
                                    <label style="display: block; margin-bottom: 5px;">Reason:</label>
                                    <textarea id="appointmentReason" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 80px;" placeholder="Brief description"></textarea>
                                </div>
                                <button type="submit" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                                    Book Appointment
                                </button>
                            </form>
                        </div>
                    `;

                    // Add form submit handler
                    document.getElementById('simpleBookingForm').addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const teacherId = document.getElementById('teacherSelect').value;
                        const date = document.getElementById('appointmentDate').value;
                        const time = document.getElementById('appointmentTime').value;
                        const reason = document.getElementById('appointmentReason').value;

                        if (!teacherId || !date || !time || !reason) {
                            alert('Please fill all fields');
                            return;
                        }

                        // Create appointment
                        const appointmentData = {
                            id: 'apt-' + Date.now(),
                            studentId: window.authManagerInstance.currentUser.uid,
                            studentEmail: window.authManagerInstance.currentUser.email,
                            teacherId: teacherId,
                            date: date,
                            time: time,
                            reason: reason,
                            status: 'pending',
                            createdAt: new Date().toISOString()
                        };

                        await db.doc('appointments', appointmentData.id).set(appointmentData);
                        alert('Appointment booked successfully!');
                        contentDiv.innerHTML = '';
                    });

                } catch (error) {
                    console.error('❌ Error loading booking form:', error);
                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>❌ Error</h3>
                            <p>Failed to load booking form. Please try again.</p>
                        </div>
                    `;
                }
            });

            viewBtn?.addEventListener('click', async () => {
                console.log('📋 View Appointments button clicked');
                const contentDiv = document.getElementById('studentContent');
                if (!contentDiv) {
                    console.error('❌ Cannot find studentContent div');
                    return;
                }

                try {
                    // Get appointments for current user
                    const appointmentsSnapshot = await db.collection('appointments').get();
                    const allAppointments = appointmentsSnapshot.docs.map(doc => doc.data());
                    const myAppointments = allAppointments.filter(apt => apt.studentId === window.authManagerInstance.currentUser.uid);

                    console.log('📋 Found appointments:', myAppointments.length);

                    let appointmentsHTML = '';
                    if (myAppointments.length > 0) {
                        appointmentsHTML = myAppointments.map(apt => `
                            <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid ${apt.status === 'pending' ? '#ffc107' : apt.status === 'approved' ? '#28a745' : '#dc3545'};">
                                <h4>Appointment #${apt.id.split('-')[1]}</h4>
                                <p><strong>Teacher ID:</strong> ${apt.teacherId}</p>
                                <p><strong>Date:</strong> ${new Date(apt.date).toLocaleDateString()}</p>
                                <p><strong>Time:</strong> ${apt.time}</p>
                                <p><strong>Reason:</strong> ${apt.reason}</p>
                                <p><strong>Status:</strong> <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; background: ${apt.status === 'pending' ? '#fff3cd' : apt.status === 'approved' ? '#d4edda' : '#f8d7da'}; color: ${apt.status === 'pending' ? '#856404' : apt.status === 'approved' ? '#155724' : '#721c24'};">${apt.status.toUpperCase()}</span></p>
                                ${apt.status === 'pending' ? `
                                    <button onclick="if(confirm('Cancel this appointment?')) { 
                                        db.doc('appointments', '${apt.id}').delete(); 
                                        alert('Appointment cancelled'); 
                                        document.getElementById('viewAppointmentsBtn').click(); 
                                    }" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                        Cancel
                                    </button>
                                ` : ''}
                            </div>
                        `).join('');
                    } else {
                        appointmentsHTML = `
                            <div style="text-align: center; padding: 40px;">
                                <p>You have no appointments yet.</p>
                                <button onclick="document.getElementById('bookAppointmentBtn').click()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                                    Book Your First Appointment
                                </button>
                            </div>
                        `;
                    }

                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>📋 My Appointments</h3>
                            <div style="margin: 20px 0;">
                                ${appointmentsHTML}
                            </div>
                        </div>
                    `;

                } catch (error) {
                    console.error('❌ Error loading appointments:', error);
                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>❌ Error</h3>
                            <p>Failed to load appointments. Please try again.</p>
                        </div>
                    `;
                }
            });
            
            // Add a simple test to verify content div is working
            setTimeout(() => {
                const testDiv = document.getElementById('studentContent');
                if (testDiv) {
                    testDiv.style.border = '2px solid red';
                    testDiv.style.minHeight = '100px';
                    testDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    console.log('🧪 Test styling applied to studentContent div');
                }
            }, 1000);
            
            console.log('✅ Student event listeners setup complete');
        }
    }

    // Student functionality methods
    async showSearchTeachers() {
        console.log('🔍 showSearchTeachers method called');
        const contentDiv = document.getElementById('studentContent');
        if (!contentDiv) {
            console.error('❌ studentContent div not found');
            return;
        }

        console.log('✅ studentContent div found:', contentDiv);

        try {
            console.log('🔄 Fetching teachers from database...');
            // Get all approved teachers
            const usersSnapshot = await db.collection('users').get();
            const teachers = usersSnapshot.docs
                .map(doc => doc.data())
                .filter(user => user.role === 'teacher' && user.status === 'approved');

            console.log('👨‍🏫 Found teachers:', teachers.length);

            const htmlContent = `
                <div class="search-teachers-section">
                    <h3><i class="fas fa-search"></i> Search Teachers</h3>
                    
                    <div class="search-filters">
                        <div class="form-group">
                            <label for="departmentFilter">Filter by Department:</label>
                            <select id="departmentFilter">
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
                        
                        <div class="form-group">
                            <label for="subjectFilter">Search by Subject:</label>
                            <input type="text" id="subjectFilter" placeholder="e.g., Data Structures, Calculus">
                        </div>
                        
                        <button id="applyFilters" class="btn btn-primary">Search</button>
                        <button id="clearFilters" class="btn btn-secondary">Clear</button>
                    </div>
                    
                    <div id="teachersResults" class="teachers-grid">
                        ${this.renderTeachersGrid(teachers)}
                    </div>
                </div>
            `;

            console.log('📝 Setting HTML content...');
            contentDiv.innerHTML = htmlContent;
            console.log('✅ HTML content set successfully');
            console.log('📊 Content div dimensions:', {
                width: contentDiv.offsetWidth,
                height: contentDiv.offsetHeight,
                display: window.getComputedStyle(contentDiv).display,
                visibility: window.getComputedStyle(contentDiv).visibility
            });

            // Add filter event listeners
            document.getElementById('applyFilters')?.addEventListener('click', () => {
                this.filterTeachers(teachers);
            });

            document.getElementById('clearFilters')?.addEventListener('click', () => {
                document.getElementById('departmentFilter').value = '';
                document.getElementById('subjectFilter').value = '';
                document.getElementById('teachersResults').innerHTML = this.renderTeachersGrid(teachers);
            });

        } catch (error) {
            contentDiv.innerHTML = '<p class="error">Error loading teachers. Please try again.</p>';
            logger.logError(error, 'Loading teachers for student');
        }
    }
                document.getElementById('subjectFilter').value = '';
                document.getElementById('teachersResults').innerHTML = this.renderTeachersGrid(teachers);
            });

        } catch (error) {
            contentDiv.innerHTML = '<p class="error">Error loading teachers. Please try again.</p>';
            logger.logError(error, 'Loading teachers for student');
        }
    }

    renderTeachersGrid(teachers) {
        if (teachers.length === 0) {
            return '<p class="no-data">No teachers found.</p>';
        }

        return teachers.map(teacher => `
            <div class="teacher-card">
                <div class="teacher-info">
                    <h4>${teacher.name}</h4>
                    <p><strong>Department:</strong> ${teacher.department}</p>
                    <p><strong>Subject:</strong> ${teacher.subject}</p>
                    <p><strong>Office Hours:</strong> ${teacher.officeHours || 'Not specified'}</p>
                    <p><strong>Email:</strong> ${teacher.email}</p>
                </div>
                <div class="teacher-actions">
                    <button onclick="bookWithTeacher('${teacher.uid}')" class="btn btn-primary btn-sm">
                        <i class="fas fa-calendar-plus"></i> Book Appointment
                    </button>
                </div>
            </div>
        `).join('');
    }

    filterTeachers(allTeachers) {
        const departmentFilter = document.getElementById('departmentFilter').value;
        const subjectFilter = document.getElementById('subjectFilter').value.toLowerCase();

        let filteredTeachers = allTeachers;

        if (departmentFilter) {
            filteredTeachers = filteredTeachers.filter(t => t.department === departmentFilter);
        }

        if (subjectFilter) {
            filteredTeachers = filteredTeachers.filter(t => 
                t.subject.toLowerCase().includes(subjectFilter) ||
                t.name.toLowerCase().includes(subjectFilter)
            );
        }

        document.getElementById('teachersResults').innerHTML = this.renderTeachersGrid(filteredTeachers);
    }

    async showBookAppointment() {
        console.log('📅 showBookAppointment method called');
        const contentDiv = document.getElementById('studentContent');
        if (!contentDiv) {
            console.error('❌ studentContent div not found');
            return;
        }

        console.log('✅ studentContent div found for booking');

        try {
            console.log('🔄 Fetching teachers for booking...');
            // Get all approved teachers for booking
            const usersSnapshot = await db.collection('users').get();
            const teachers = usersSnapshot.docs
                .map(doc => doc.data())
                .filter(user => user.role === 'teacher' && user.status === 'approved');

            console.log('👨‍🏫 Found teachers for booking:', teachers.length);

            contentDiv.innerHTML = `
                <div class="book-appointment-section">
                    <h3><i class="fas fa-calendar-plus"></i> Book Appointment</h3>
                    
                    <form id="appointmentForm" class="appointment-form">
                        <div class="form-group">
                            <label for="selectTeacher">Select Teacher:</label>
                            <select id="selectTeacher" required>
                                <option value="">Choose a teacher</option>
                                ${teachers.map(teacher => 
                                    `<option value="${teacher.uid}">${teacher.name} - ${teacher.subject} (${teacher.department})</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="appointmentDate">Date:</label>
                            <input type="date" id="appointmentDate" required min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label for="appointmentTime">Time:</label>
                            <select id="appointmentTime" required>
                                <option value="">Select time</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">01:00 PM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                                <option value="17:00">05:00 PM</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="appointmentReason">Reason for Appointment:</label>
                            <textarea id="appointmentReason" rows="3" placeholder="Brief description of what you'd like to discuss" required></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Book Appointment</button>
                            <button type="button" id="cancelBooking" class="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            `;

            // Add form event listeners
            document.getElementById('appointmentForm')?.addEventListener('submit', (e) => {
                this.handleAppointmentBooking(e);
            });

            document.getElementById('cancelBooking')?.addEventListener('click', () => {
                contentDiv.innerHTML = '';
            });

        } catch (error) {
            contentDiv.innerHTML = '<p class="error">Error loading booking form. Please try again.</p>';
            logger.logError(error, 'Loading appointment booking form');
        }
    }

    async handleAppointmentBooking(e) {
        e.preventDefault();

        const teacherId = document.getElementById('selectTeacher').value;
        const date = document.getElementById('appointmentDate').value;
        const time = document.getElementById('appointmentTime').value;
        const reason = document.getElementById('appointmentReason').value;

        try {
            // Create appointment data
            const appointmentData = {
                id: 'apt-' + Date.now(),
                studentId: this.currentUser.uid,
                studentEmail: this.currentUser.email,
                teacherId: teacherId,
                date: date,
                time: time,
                reason: reason,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // Save appointment
            await db.doc('appointments', appointmentData.id).set(appointmentData);

            this.showNotification('Appointment booked successfully! Teacher will be notified.', 'success');
            
            // Clear the form
            document.getElementById('studentContent').innerHTML = '';
            
            logger.info('Appointment booked', { appointmentId: appointmentData.id });

        } catch (error) {
            this.showNotification('Error booking appointment. Please try again.', 'error');
            logger.logError(error, 'Booking appointment');
        }
    }

    async showMyAppointments() {
        console.log('📋 showMyAppointments method called');
        const contentDiv = document.getElementById('studentContent');
        if (!contentDiv) {
            console.error('❌ studentContent div not found');
            return;
        }

        console.log('✅ studentContent div found for appointments');

        try {
            // Get appointments for current student
            const appointmentsSnapshot = await db.collection('appointments').get();
            const allAppointments = appointmentsSnapshot.docs.map(doc => doc.data());
            const myAppointments = allAppointments.filter(apt => apt.studentId === this.currentUser.uid);

            // Get teacher names for appointments
            const usersSnapshot = await db.collection('users').get();
            const users = usersSnapshot.docs.map(doc => doc.data());
            
            // Add teacher info to appointments
            const appointmentsWithTeachers = myAppointments.map(apt => {
                const teacher = users.find(u => u.uid === apt.teacherId);
                return {
                    ...apt,
                    teacherName: teacher ? teacher.name : 'Unknown Teacher',
                    teacherSubject: teacher ? teacher.subject : 'Unknown Subject'
                };
            });

            contentDiv.innerHTML = `
                <div class="my-appointments-section">
                    <h3><i class="fas fa-calendar-check"></i> My Appointments</h3>
                    
                    ${appointmentsWithTeachers.length > 0 ? `
                        <div class="appointments-list">
                            ${appointmentsWithTeachers.map(apt => `
                                <div class="appointment-card status-${apt.status}">
                                    <div class="appointment-header">
                                        <h4>${apt.teacherName}</h4>
                                        <span class="status-badge ${apt.status}">${apt.status.toUpperCase()}</span>
                                    </div>
                                    <div class="appointment-details">
                                        <p><strong>Subject:</strong> ${apt.teacherSubject}</p>
                                        <p><strong>Date:</strong> ${new Date(apt.date).toLocaleDateString()}</p>
                                        <p><strong>Time:</strong> ${apt.time}</p>
                                        <p><strong>Reason:</strong> ${apt.reason}</p>
                                        <p><strong>Booked:</strong> ${new Date(apt.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    ${apt.status === 'pending' ? `
                                        <div class="appointment-actions">
                                            <button onclick="cancelAppointment('${apt.id}')" class="btn btn-danger btn-sm">
                                                <i class="fas fa-times"></i> Cancel
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="no-appointments">
                            <p>You have no appointments yet.</p>
                            <button id="bookFirstAppointment" class="btn btn-primary">Book Your First Appointment</button>
                        </div>
                    `}
                </div>
            `;

            // Add event listener for booking first appointment
            document.getElementById('bookFirstAppointment')?.addEventListener('click', () => {
                this.showBookAppointment();
            });

            // Make cancel function globally available
            window.cancelAppointment = async (appointmentId) => {
                if (confirm('Are you sure you want to cancel this appointment?')) {
                    try {
                        await db.doc('appointments', appointmentId).delete();
                        this.showNotification('Appointment cancelled successfully', 'success');
                        this.showMyAppointments(); // Refresh the list
                    } catch (error) {
                        this.showNotification('Error cancelling appointment', 'error');
                        logger.logError(error, 'Cancelling appointment');
                    }
                }
            };

        } catch (error) {
            contentDiv.innerHTML = '<p class="error">Error loading appointments. Please try again.</p>';
            logger.logError(error, 'Loading student appointments');
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

    // Method to book appointment with specific teacher
    async showBookAppointmentWithTeacher(teacherId) {
        try {
            // Get teacher info
            const teacherDoc = await db.doc('users', teacherId).get();
            const teacher = teacherDoc.data();
            
            if (!teacher) {
                this.showNotification('Teacher not found', 'error');
                return;
            }

            const contentDiv = document.getElementById('studentContent');
            if (!contentDiv) return;

            contentDiv.innerHTML = `
                <div class="book-appointment-section">
                    <h3><i class="fas fa-calendar-plus"></i> Book Appointment with ${teacher.name}</h3>
                    
                    <div class="teacher-details">
                        <p><strong>Department:</strong> ${teacher.department}</p>
                        <p><strong>Subject:</strong> ${teacher.subject}</p>
                        <p><strong>Email:</strong> ${teacher.email}</p>
                    </div>
                    
                    <form id="appointmentForm" class="appointment-form">
                        <input type="hidden" id="selectedTeacherId" value="${teacherId}">
                        
                        <div class="form-group">
                            <label for="appointmentDate">Date:</label>
                            <input type="date" id="appointmentDate" required min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label for="appointmentTime">Time:</label>
                            <select id="appointmentTime" required>
                                <option value="">Select time</option>
                                <option value="09:00">09:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="13:00">01:00 PM</option>
                                <option value="14:00">02:00 PM</option>
                                <option value="15:00">03:00 PM</option>
                                <option value="16:00">04:00 PM</option>
                                <option value="17:00">05:00 PM</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="appointmentReason">Reason for Appointment:</label>
                            <textarea id="appointmentReason" rows="3" placeholder="Brief description of what you'd like to discuss" required></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Book Appointment</button>
                            <button type="button" id="cancelBooking" class="btn btn-secondary">Back to Search</button>
                        </div>
                    </form>
                </div>
            `;

            // Add form event listeners
            document.getElementById('appointmentForm')?.addEventListener('submit', (e) => {
                this.handleAppointmentBooking(e);
            });

            document.getElementById('cancelBooking')?.addEventListener('click', () => {
                this.showSearchTeachers();
            });

        } catch (error) {
            this.showNotification('Error loading booking form', 'error');
            logger.logError(error, 'Loading specific teacher booking form');
        }
    }
}

// Global functions for button clicks
window.bookWithTeacher = function(teacherId) {
    if (window.authManagerInstance) {
        window.authManagerInstance.showBookAppointmentWithTeacher(teacherId);
    }
};

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Auth Manager...');
    window.authManagerInstance = new AuthManager();
});

// Make AuthManager available globally for debugging
window.AuthManager = AuthManager;
