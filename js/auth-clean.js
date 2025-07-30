// Authentication Module - Clean Working Version
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
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            console.log('✅ Register form found, adding event listener');
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Role selection for conditional fields
        const registerRole = document.getElementById('registerRole');
        if (registerRole) {
            console.log('✅ Register role select found, adding event listener');
            registerRole.addEventListener('change', () => this.toggleConditionalFields());
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
        }

        const heroRegisterBtn = document.getElementById('heroRegisterBtn');
        if (heroRegisterBtn) {
            console.log('✅ Hero Register button found, adding event listener');
            heroRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔄 Hero Register button clicked');
                this.showRegister();
            });
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
            
            // Add a small delay to ensure DOM is fully rendered
            setTimeout(() => {
                this.setupDashboardEventListeners(role);
            }, 100);
        }
        
        logger.logUserAction('Dashboard loaded', { role });
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
                            <button id="setAvailabilityBtn" class="btn btn-primary">Set Availability</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-calendar-check"></i>
                            <h4>View Appointments</h4>
                            <p>See your scheduled meetings</p>
                            <button id="viewTeacherAppointmentsBtn" class="btn btn-primary">View Appointments</button>
                        </div>
                        
                        <div class="section-card">
                            <i class="fas fa-user-edit"></i>
                            <h4>Update Profile</h4>
                            <p>Edit your information</p>
                            <button id="editTeacherProfileBtn" class="btn btn-primary">Edit Profile</button>
                        </div>
                    </div>
                    
                    <!-- Dynamic content area for teacher features -->
                    <div id="teacherContent" style="margin-top: 30px;"></div>
                </div>
            </section>
        `;
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
                                        <div class="teacher-card pending" style="background: white; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #ffc107;">
                                            <h4 style="color: #495057; margin-bottom: 10px;">${teacher.name}</h4>
                                            <p><strong>Email:</strong> ${teacher.email}</p>
                                            <p><strong>Department:</strong> ${teacher.department}</p>
                                            <p><strong>Subject:</strong> ${teacher.subject}</p>
                                            <p><strong>Office Hours:</strong> ${teacher.officeHours || 'Not specified'}</p>
                                            <p><strong>Status:</strong> <span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px;">PENDING</span></p>
                                            <div style="margin-top: 15px;">
                                                <button onclick="approveTeacher('${teacher.uid}')" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                                    <i class="fas fa-check"></i> Approve
                                                </button>
                                                <button onclick="rejectTeacher('${teacher.uid}')" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                                    <i class="fas fa-times"></i> Reject
                                                </button>
                                            </div>
                                        </div>
                                    `).join('') 
                                    : '<p class="no-data" style="text-align: center; padding: 40px; color: #6c757d;">No pending teacher approvals</p>'
                                }
                            </div>
                        </div>
                        
                        <div class="admin-section">
                            <h3><i class="fas fa-chalkboard-teacher"></i> Approved Teachers</h3>
                            <div class="teachers-list">
                                ${approvedTeachers.length > 0 ? 
                                    approvedTeachers.map(teacher => `
                                        <div style="background: white; border: 1px solid #28a745; border-radius: 8px; padding: 15px; margin: 10px 0; border-left: 4px solid #28a745;">
                                            <h4 style="color: #495057;">${teacher.name}</h4>
                                            <p><strong>Email:</strong> ${teacher.email}</p>
                                            <p><strong>Department:</strong> ${teacher.department}</p>
                                            <p><strong>Subject:</strong> ${teacher.subject}</p>
                                            <p><strong>Status:</strong> <span style="background: #d4edda; color: #155724; padding: 4px 8px; border-radius: 4px; font-size: 12px;">APPROVED</span></p>
                                        </div>
                                    `).join('') 
                                    : '<p style="text-align: center; padding: 40px; color: #6c757d;">No approved teachers found</p>'
                                }
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

    // Setup dashboard event listeners
    setupDashboardEventListeners(role) {
        // Logout button
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        if (role === 'student') {
            this.setupStudentDashboardListeners();
        } else if (role === 'teacher') {
            this.setupTeacherDashboardListeners();
        } else if (role === 'admin') {
            this.setupAdminDashboardListeners();
        }
    }

    // Setup admin dashboard event listeners
    setupAdminDashboardListeners() {
        console.log('🔧 Setting up admin dashboard listeners');
        
        // Make approval functions globally available
        window.approveTeacher = async (teacherId) => {
            try {
                console.log('✅ Approving teacher:', teacherId);
                await db.doc('users', teacherId).update({ status: 'approved' });
                this.showNotification('Teacher approved successfully!', 'success');
                
                // Refresh the admin dashboard
                this.loadDashboard('admin');
                
                console.log('✅ Teacher approved successfully');
            } catch (error) {
                console.error('❌ Error approving teacher:', error);
                this.showNotification('Error approving teacher', 'error');
            }
        };

        window.rejectTeacher = async (teacherId) => {
            if (confirm('Are you sure you want to reject this teacher?')) {
                try {
                    console.log('❌ Rejecting teacher:', teacherId);
                    await db.doc('users', teacherId).update({ status: 'rejected' });
                    this.showNotification('Teacher rejected', 'info');
                    
                    // Refresh the admin dashboard
                    this.loadDashboard('admin');
                    
                    console.log('❌ Teacher rejected');
                } catch (error) {
                    console.error('❌ Error rejecting teacher:', error);
                    this.showNotification('Error rejecting teacher', 'error');
                }
            }
        };

        console.log('✅ Admin dashboard listeners setup complete');
    }

    // Setup student dashboard event listeners
    setupStudentDashboardListeners() {
        console.log('🎯 Setting up student dashboard event listeners');
        
        const searchBtn = document.getElementById('searchTeachersBtn');
        const bookBtn = document.getElementById('bookAppointmentBtn');
        const viewBtn = document.getElementById('viewAppointmentsBtn');
        
        console.log('🔍 Found buttons:', { 
            searchBtn: !!searchBtn, 
            bookBtn: !!bookBtn, 
            viewBtn: !!viewBtn,
            searchBtnElement: searchBtn,
            bookBtnElement: bookBtn,
            viewBtnElement: viewBtn
        });
        
        // Search Teachers
        if (searchBtn) {
            console.log('✅ Adding event listener to Search Teachers button');
            searchBtn.addEventListener('click', async () => {
                console.log('🔍 Search Teachers button clicked');
                const contentDiv = document.getElementById('studentContent');
                if (!contentDiv) {
                    console.error('❌ Cannot find studentContent div');
                    return;
                }

                try {
                    console.log('🔄 Loading teachers...');
                    const usersSnapshot = await db.collection('users').get();
                    const teachers = usersSnapshot.docs
                        .map(doc => doc.data())
                        .filter(user => user.role === 'teacher' && user.status === 'approved');

                    console.log('👨‍🏫 Found teachers:', teachers.length);

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
        } else {
            console.error('❌ Search Teachers button not found!');
        }

        // Book Appointment
        if (bookBtn) {
            console.log('✅ Adding event listener to Book Appointment button');
            bookBtn.addEventListener('click', async () => {
                console.log('📅 Book Appointment button clicked');
                const contentDiv = document.getElementById('studentContent');
                if (!contentDiv) return;

                try {
                    // Get available teachers
                    const usersSnapshot = await db.collection('users').get();
                    const teachers = usersSnapshot.docs
                        .map(doc => doc.data())
                        .filter(user => user.role === 'teacher' && user.status === 'approved');

                    const teacherOptions = teachers.map(teacher => 
                        `<option value="${teacher.email}">${teacher.name} - ${teacher.department} (${teacher.subject})</option>`
                    ).join('');

                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>📅 Book Appointment</h3>
                            <form id="bookingForm" style="max-width: 600px;">
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Select Teacher:</label>
                                    <select id="teacherSelect" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                        <option value="">Choose a teacher...</option>
                                        ${teacherOptions}
                                    </select>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Date:</label>
                                    <input type="date" id="appointmentDate" required min="${new Date().toISOString().split('T')[0]}" 
                                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Time:</label>
                                    <select id="appointmentTime" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                        <option value="">Select time...</option>
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
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Subject/Topic:</label>
                                    <input type="text" id="appointmentSubject" required placeholder="e.g., Doubt in Data Structures" 
                                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Message (Optional):</label>
                                    <textarea id="appointmentMessage" rows="3" placeholder="Additional details..." 
                                              style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
                                </div>
                                <button type="submit" style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                    Book Appointment
                                </button>
                                <button type="button" onclick="document.getElementById('studentContent').innerHTML='';" 
                                        style="background: #6c757d; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer;">
                                    Cancel
                                </button>
                            </form>
                        </div>
                    `;

                    // Add form submission handler
                    const form = document.getElementById('bookingForm');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const teacherEmail = document.getElementById('teacherSelect').value;
                        const date = document.getElementById('appointmentDate').value;
                        const time = document.getElementById('appointmentTime').value;
                        const subject = document.getElementById('appointmentSubject').value;
                        const message = document.getElementById('appointmentMessage').value;

                        if (!teacherEmail || !date || !time || !subject) {
                            alert('Please fill in all required fields.');
                            return;
                        }

                        try {
                            // Create appointment object
                            const appointment = {
                                id: 'apt_' + Date.now(),
                                studentEmail: this.currentUser.email,
                                studentName: this.currentUser.name,
                                teacherEmail: teacherEmail,
                                teacherName: teachers.find(t => t.email === teacherEmail)?.name,
                                date: date,
                                time: time,
                                subject: subject,
                                message: message,
                                status: 'pending',
                                createdAt: new Date().toISOString()
                            };

                            // Save appointment
                            await db.collection('appointments').add(appointment);

                            // Show success message
                            contentDiv.innerHTML = `
                                <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                                    <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px;">
                                        <h3 style="margin-top: 0;">✅ Appointment Booked Successfully!</h3>
                                        <p><strong>Teacher:</strong> ${appointment.teacherName}</p>
                                        <p><strong>Date:</strong> ${appointment.date}</p>
                                        <p><strong>Time:</strong> ${appointment.time}</p>
                                        <p><strong>Subject:</strong> ${appointment.subject}</p>
                                        <p style="margin-bottom: 0;"><strong>Status:</strong> Pending approval</p>
                                    </div>
                                    <button onclick="document.getElementById('studentContent').innerHTML='';" 
                                            style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 15px;">
                                        Close
                                    </button>
                                </div>
                            `;

                            console.log('✅ Appointment booked successfully:', appointment);
                        } catch (error) {
                            console.error('❌ Error booking appointment:', error);
                            alert('Error booking appointment. Please try again.');
                        }
                    });

                } catch (error) {
                    console.error('❌ Error loading teachers for booking:', error);
                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>❌ Error</h3>
                            <p>Failed to load teachers. Please try again.</p>
                        </div>
                    `;
                }
            });
        } else {
            console.error('❌ Book Appointment button not found!');
        }

        // View Appointments
        if (viewBtn) {
            console.log('✅ Adding event listener to View Appointments button');
            viewBtn.addEventListener('click', async () => {
                console.log('📋 View Appointments button clicked');
                const contentDiv = document.getElementById('studentContent');
                if (!contentDiv) return;

                try {
                    // Get student's appointments
                    const appointmentsSnapshot = await db.collection('appointments').get();
                    const appointments = appointmentsSnapshot.docs
                        .map(doc => doc.data())
                        .filter(apt => apt.studentEmail === this.currentUser.email)
                        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

                    const appointmentsHTML = appointments.length > 0 ? appointments.map(apt => {
                        const statusColor = apt.status === 'confirmed' ? '#28a745' : 
                                          apt.status === 'pending' ? '#ffc107' : '#dc3545';
                        const statusIcon = apt.status === 'confirmed' ? '✅' : 
                                         apt.status === 'pending' ? '⏳' : '❌';
                        
                        return `
                            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <h4 style="margin: 0 0 10px 0;">${apt.subject}</h4>
                                        <p style="margin: 5px 0;"><strong>Teacher:</strong> ${apt.teacherName}</p>
                                        <p style="margin: 5px 0;"><strong>Date:</strong> ${apt.date}</p>
                                        <p style="margin: 5px 0;"><strong>Time:</strong> ${apt.time}</p>
                                        ${apt.message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${apt.message}</p>` : ''}
                                    </div>
                                    <div style="text-align: center;">
                                        <span style="color: ${statusColor}; font-size: 24px;">${statusIcon}</span>
                                        <br>
                                        <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                                            ${apt.status}
                                        </span>
                                    </div>
                                </div>
                                ${apt.status === 'pending' ? `
                                    <button onclick="cancelAppointment('${apt.id}')" 
                                            style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
                                        Cancel Appointment
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    }).join('') : '<div style="text-align: center; padding: 20px; color: #6c757d;">No appointments found.</div>';

                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>📋 My Appointments</h3>
                            ${appointmentsHTML}
                        </div>
                    `;

                    // Add cancel appointment function to global scope
                    window.cancelAppointment = async (appointmentId) => {
                        if (confirm('Are you sure you want to cancel this appointment?')) {
                            try {
                                console.log('🔄 Cancelling appointment:', appointmentId);
                                
                                // Get appointments from the mock database storage
                                const storageKey = 'mock_appointments';
                                const appointmentsCollection = JSON.parse(localStorage.getItem(storageKey) || '{}');
                                
                                // Remove the appointment
                                let appointmentDeleted = false;
                                for (const [key, appointment] of Object.entries(appointmentsCollection)) {
                                    if (appointment.id === appointmentId) {
                                        delete appointmentsCollection[key];
                                        appointmentDeleted = true;
                                        console.log('✅ Found and deleted appointment:', appointment);
                                        break;
                                    }
                                }
                                
                                if (appointmentDeleted) {
                                    // Save back to mock database
                                    localStorage.setItem(storageKey, JSON.stringify(appointmentsCollection));
                                    
                                    // Refresh the view
                                    viewBtn.click();
                                    
                                    console.log('✅ Appointment cancelled successfully');
                                } else {
                                    console.error('❌ Appointment not found:', appointmentId);
                                    alert('Appointment not found. Please refresh and try again.');
                                }
                                
                                // Refresh the view
                                viewBtn.click();
                                
                                console.log('✅ Appointment cancelled');
                            } catch (error) {
                                console.error('❌ Error cancelling appointment:', error);
                                alert('Error cancelling appointment. Please try again.');
                            }
                        }
                    };

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
        } else {
            console.error('❌ View Appointments button not found!');
        }
        
        console.log('✅ Student event listeners setup complete');
    }

    // Setup teacher dashboard event listeners
    setupTeacherDashboardListeners() {
        console.log('🎯 Setting up teacher dashboard event listeners');
        
        const setAvailabilityBtn = document.getElementById('setAvailabilityBtn');
        const viewAppointmentsBtn = document.getElementById('viewTeacherAppointmentsBtn');
        const editProfileBtn = document.getElementById('editTeacherProfileBtn');
        
        console.log('🔍 Found teacher buttons:', { 
            setAvailabilityBtn: !!setAvailabilityBtn, 
            viewAppointmentsBtn: !!viewAppointmentsBtn, 
            editProfileBtn: !!editProfileBtn,
            setAvailabilityBtnElement: setAvailabilityBtn,
            viewAppointmentsBtnElement: viewAppointmentsBtn,
            editProfileBtnElement: editProfileBtn
        });
        
        // Set Availability
        if (setAvailabilityBtn) {
            console.log('✅ Adding event listener to Set Availability button');
            setAvailabilityBtn.addEventListener('click', () => {
                console.log('📅 Set Availability button clicked');
                const contentDiv = document.getElementById('teacherContent');
                if (!contentDiv) {
                    console.error('❌ Cannot find teacherContent div');
                    return;
                }

                contentDiv.innerHTML = `
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>📅 Set Availability</h3>
                        <form id="availabilityForm" style="max-width: 500px;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Day of the Week:</label>
                                <select id="daySelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="">Select Day</option>
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Start Time:</label>
                                <input type="time" id="startTime" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">End Time:</label>
                                <input type="time" id="endTime" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <button type="button" onclick="this.parentElement.nextElementSibling.style.display='block'; this.parentElement.style.display='none';" 
                                    style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                                Set Availability
                            </button>
                        </form>
                        <div style="display: none; background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px;">
                            <strong>✅ Success!</strong> Your availability has been set.
                        </div>
                    </div>
                `;
            });
        } else {
            console.error('❌ Set Availability button not found!');
        }

        // View Appointments
        if (viewAppointmentsBtn) {
            console.log('✅ Adding event listener to View Teacher Appointments button');
            viewAppointmentsBtn.addEventListener('click', async () => {
                console.log('📋 View Teacher Appointments button clicked');
                const contentDiv = document.getElementById('teacherContent');
                if (!contentDiv) return;

                try {
                    // Get teacher's appointments
                    const appointmentsSnapshot = await db.collection('appointments').get();
                    const appointments = appointmentsSnapshot.docs
                        .map(doc => doc.data())
                        .filter(apt => apt.teacherEmail === this.currentUser.email)
                        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));

                    const appointmentsHTML = appointments.length > 0 ? appointments.map(apt => {
                        const statusColor = apt.status === 'confirmed' ? '#28a745' : 
                                          apt.status === 'pending' ? '#ffc107' : '#dc3545';
                        const statusIcon = apt.status === 'confirmed' ? '✅' : 
                                         apt.status === 'pending' ? '⏳' : '❌';
                        
                        return `
                            <div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin: 10px 0;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="flex: 1;">
                                        <h4 style="margin: 0 0 10px 0;">${apt.subject}</h4>
                                        <p style="margin: 5px 0;"><strong>Student:</strong> ${apt.studentName} (${apt.studentEmail})</p>
                                        <p style="margin: 5px 0;"><strong>Date:</strong> ${apt.date}</p>
                                        <p style="margin: 5px 0;"><strong>Time:</strong> ${apt.time}</p>
                                        ${apt.message ? `<p style="margin: 5px 0;"><strong>Message:</strong> ${apt.message}</p>` : ''}
                                        <p style="margin: 5px 0; color: #6c757d; font-size: 12px;"><strong>Booked:</strong> ${new Date(apt.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style="text-align: center; margin-left: 15px;">
                                        <span style="color: ${statusColor}; font-size: 24px;">${statusIcon}</span>
                                        <br>
                                        <span style="color: ${statusColor}; font-weight: bold; text-transform: uppercase; font-size: 12px;">
                                            ${apt.status}
                                        </span>
                                    </div>
                                </div>
                                ${apt.status === 'pending' ? `
                                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                                        <button onclick="approveAppointment('${apt.id}')" 
                                                style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                            ✅ Approve
                                        </button>
                                        <button onclick="rejectAppointment('${apt.id}')" 
                                                style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                                            ❌ Reject
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('') : '<div style="text-align: center; padding: 20px; color: #6c757d;">No appointments found.</div>';

                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>📋 My Appointments</h3>
                            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 10px; margin-bottom: 20px;">
                                <strong>📊 Summary:</strong> ${appointments.length} total appointments 
                                (${appointments.filter(a => a.status === 'pending').length} pending, 
                                ${appointments.filter(a => a.status === 'confirmed').length} confirmed, 
                                ${appointments.filter(a => a.status === 'rejected').length} rejected)
                            </div>
                            ${appointmentsHTML}
                        </div>
                    `;

                    // Add appointment management functions to global scope
                    window.approveAppointment = async (appointmentId) => {
                        try {
                            console.log('🔄 Approving appointment:', appointmentId);
                            
                            // Get appointments from the mock database storage
                            const storageKey = 'mock_appointments';
                            const appointmentsCollection = JSON.parse(localStorage.getItem(storageKey) || '{}');
                            
                            // Find and update the appointment
                            let appointmentUpdated = false;
                            for (const [key, appointment] of Object.entries(appointmentsCollection)) {
                                if (appointment.id === appointmentId) {
                                    appointmentsCollection[key] = { ...appointment, status: 'confirmed' };
                                    appointmentUpdated = true;
                                    console.log('✅ Found and updated appointment:', appointment);
                                    break;
                                }
                            }
                            
                            if (appointmentUpdated) {
                                // Save back to mock database
                                localStorage.setItem(storageKey, JSON.stringify(appointmentsCollection));
                                
                                // Refresh the view
                                viewAppointmentsBtn.click();
                                
                                console.log('✅ Appointment approved successfully');
                            } else {
                                console.error('❌ Appointment not found:', appointmentId);
                                alert('Appointment not found. Please refresh and try again.');
                            }
                        } catch (error) {
                            console.error('❌ Error approving appointment:', error);
                            alert('Error approving appointment. Please try again.');
                        }
                    };

                    window.rejectAppointment = async (appointmentId) => {
                        if (confirm('Are you sure you want to reject this appointment?')) {
                            try {
                                console.log('🔄 Rejecting appointment:', appointmentId);
                                
                                // Get appointments from the mock database storage
                                const storageKey = 'mock_appointments';
                                const appointmentsCollection = JSON.parse(localStorage.getItem(storageKey) || '{}');
                                
                                // Find and update the appointment
                                let appointmentUpdated = false;
                                for (const [key, appointment] of Object.entries(appointmentsCollection)) {
                                    if (appointment.id === appointmentId) {
                                        appointmentsCollection[key] = { ...appointment, status: 'rejected' };
                                        appointmentUpdated = true;
                                        console.log('✅ Found and updated appointment:', appointment);
                                        break;
                                    }
                                }
                                
                                if (appointmentUpdated) {
                                    // Save back to mock database
                                    localStorage.setItem(storageKey, JSON.stringify(appointmentsCollection));
                                    
                                    // Refresh the view
                                    viewAppointmentsBtn.click();
                                    
                                    console.log('✅ Appointment rejected successfully');
                                } else {
                                    console.error('❌ Appointment not found:', appointmentId);
                                    alert('Appointment not found. Please refresh and try again.');
                                }
                            } catch (error) {
                                console.error('❌ Error rejecting appointment:', error);
                                alert('Error rejecting appointment. Please try again.');
                            }
                        }
                    };

                } catch (error) {
                    console.error('❌ Error loading teacher appointments:', error);
                    contentDiv.innerHTML = `
                        <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3>❌ Error</h3>
                            <p>Failed to load appointments. Please try again.</p>
                        </div>
                    `;
                }
            });
        } else {
            console.error('❌ View Teacher Appointments button not found!');
        }

        // Edit Profile
        if (editProfileBtn) {
            console.log('✅ Adding event listener to Edit Teacher Profile button');
            editProfileBtn.addEventListener('click', () => {
                console.log('👤 Edit Teacher Profile button clicked');
                const contentDiv = document.getElementById('teacherContent');
                if (!contentDiv) return;

                const currentUser = this.currentUser;
                contentDiv.innerHTML = `
                    <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h3>👤 Edit Profile</h3>
                        <form id="editProfileForm" style="max-width: 500px;">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Full Name:</label>
                                <input type="text" id="editName" value="${currentUser?.name || ''}" 
                                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Email:</label>
                                <input type="email" id="editEmail" value="${currentUser?.email || ''}" disabled
                                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Department:</label>
                                <select id="editDepartment" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="">Select Department</option>
                                    <option value="Computer Science" ${currentUser?.department === 'Computer Science' ? 'selected' : ''}>Computer Science</option>
                                    <option value="Mathematics" ${currentUser?.department === 'Mathematics' ? 'selected' : ''}>Mathematics</option>
                                    <option value="Physics" ${currentUser?.department === 'Physics' ? 'selected' : ''}>Physics</option>
                                    <option value="Chemistry" ${currentUser?.department === 'Chemistry' ? 'selected' : ''}>Chemistry</option>
                                    <option value="Biology" ${currentUser?.department === 'Biology' ? 'selected' : ''}>Biology</option>
                                    <option value="English" ${currentUser?.department === 'English' ? 'selected' : ''}>English</option>
                                    <option value="History" ${currentUser?.department === 'History' ? 'selected' : ''}>History</option>
                                </select>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Subject:</label>
                                <input type="text" id="editSubject" value="${currentUser?.subject || ''}" 
                                       placeholder="e.g., Data Structures, Algorithms"
                                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Office Hours:</label>
                                <input type="text" id="editOfficeHours" value="${currentUser?.officeHours || ''}" 
                                       placeholder="e.g., Mon-Fri 9:00-17:00"
                                       style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <button type="button" onclick="this.parentElement.nextElementSibling.style.display='block'; this.parentElement.style.display='none';" 
                                    style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                                Update Profile
                            </button>
                            <button type="button" onclick="document.getElementById('teacherContent').innerHTML='';" 
                                    style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
                                Cancel
                            </button>
                        </form>
                        <div style="display: none; background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px;">
                            <strong>✅ Success!</strong> Your profile has been updated.
                        </div>
                    </div>
                `;
            });
        } else {
            console.error('❌ Edit Teacher Profile button not found!');
        }
        
        console.log('✅ Teacher event listeners setup complete');
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
            
            // Auto hide after 5 seconds
            setTimeout(() => {
                notification?.classList.remove('show');
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
    window.authManagerInstance = new AuthManager();
});

// Make AuthManager available globally for debugging
window.AuthManager = AuthManager;
