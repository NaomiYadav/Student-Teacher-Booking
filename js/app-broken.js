// Main Application Module - Fixed Version
import logger from './logger.js';
import { db } from './firebase-config.js';

class AppManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.listeners = [];
        this.initializeApp();
    }

    // Initialize the application
    async initializeApp() {
        try {
            logger.info('Application initialization started');
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            logger.info('Application initialization completed');
        } catch (error) {
            logger.logError(error, 'Application initialization');
        }
    }
                    this.loadUserData().then(() => {
                        unsubscribe();
                        resolve();
                    });
                } else {
                    unsubscribe();
                    resolve();
                }
            });
        });
    }

    // Load current user data
    async loadUserData() {
        if (this.currentUser) {
            try {
                const userDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    this.userRole = userData.role;
                    logger.info('User data loaded', { role: this.userRole });
                }
            } catch (error) {
                logger.logError(error, 'Loading user data');
            }
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Handle dashboard navigation after auth
        if (this.currentUser && this.userRole) {
            this.setupDashboardHandlers();
        }
    }

    // Setup dashboard-specific handlers
    setupDashboardHandlers() {
        switch (this.userRole) {
            case 'admin':
                this.setupAdminHandlers();
                break;
            case 'teacher':
                this.setupTeacherHandlers();
                break;
            case 'student':
                this.setupStudentHandlers();
                break;
        }
    }

    // Admin Dashboard Handlers
    setupAdminHandlers() {
        setTimeout(() => {
            this.loadTeachersForAdmin();
            this.setupAdminEventListeners();
        }, 100);
    }

    setupAdminEventListeners() {
        // Add Teacher button
        const addTeacherBtn = document.getElementById('addTeacherBtn');
        if (addTeacherBtn) {
            addTeacherBtn.addEventListener('click', () => this.showAddTeacherModal());
        }

        // Download logs button
        const downloadLogsBtn = document.getElementById('downloadLogsBtn');
        if (downloadLogsBtn) {
            downloadLogsBtn.addEventListener('click', () => logger.downloadLogs());
        }
    }

    // Load teachers for admin management
    async loadTeachersForAdmin() {
        try {
            const teachersTable = document.getElementById('teachersTable');
            if (!teachersTable) return;

            const teachersQuery = query(
                collection(db, 'users'), 
                where('role', '==', 'teacher'),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot = await getDocs(teachersQuery);
            const teachers = [];
            
            querySnapshot.forEach((doc) => {
                teachers.push({ id: doc.id, ...doc.data() });
            });

            this.renderTeachersTable(teachers);
            logger.logDatabase('READ', 'users', null, { count: teachers.length, filter: 'teachers' });
            
        } catch (error) {
            logger.logError(error, 'Loading teachers for admin');
        }
    }

    // Render teachers table for admin
    renderTeachersTable(teachers) {
        const teachersTable = document.getElementById('teachersTable');
        if (!teachersTable) return;

        const tableHTML = `
            <div class="table-container">
                <table class="table">
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
                        ${teachers.map(teacher => `
                            <tr>
                                <td>${teacher.name}</td>
                                <td>${teacher.email}</td>
                                <td>${teacher.department || 'N/A'}</td>
                                <td>${teacher.subject || 'N/A'}</td>
                                <td>
                                    <span class="status status-${teacher.status}">
                                        ${teacher.status || 'pending'}
                                    </span>
                                </td>
                                <td>
                                    ${teacher.status === 'pending' ? 
                                        `<button class="btn btn-success btn-sm" onclick="app.approveTeacher('${teacher.id}')">
                                            <i class="fas fa-check"></i> Approve
                                         </button>` : ''
                                    }
                                    <button class="btn btn-warning btn-sm" onclick="app.editTeacher('${teacher.id}')">
                                        <i class="fas fa-edit"></i> Edit
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="app.deleteTeacher('${teacher.id}')">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        teachersTable.innerHTML = tableHTML;
    }

    // Approve teacher registration
    async approveTeacher(teacherId) {
        try {
            await updateDoc(doc(db, 'users', teacherId), {
                status: 'approved',
                approvedAt: new Date().toISOString()
            });
            
            this.showNotification('Teacher approved successfully', 'success');
            this.loadTeachersForAdmin();
            
            logger.logDatabase('UPDATE', 'users', teacherId, { action: 'approve_teacher' });
            logger.logUserAction('Teacher approved', { teacherId });
            
        } catch (error) {
            logger.logError(error, 'Approving teacher');
            this.showNotification('Error approving teacher', 'error');
        }
    }

    // Delete teacher
    async deleteTeacher(teacherId) {
        if (!confirm('Are you sure you want to delete this teacher?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', teacherId));
            
            this.showNotification('Teacher deleted successfully', 'success');
            this.loadTeachersForAdmin();
            
            logger.logDatabase('DELETE', 'users', teacherId, { action: 'delete_teacher' });
            logger.logUserAction('Teacher deleted', { teacherId });
            
        } catch (error) {
            logger.logError(error, 'Deleting teacher');
            this.showNotification('Error deleting teacher', 'error');
        }
    }

    // Teacher Dashboard Handlers
    setupTeacherHandlers() {
        setTimeout(() => {
            this.loadTeacherAppointments();
            this.loadTeacherMessages();
            this.setupTeacherEventListeners();
        }, 100);
    }

    setupTeacherEventListeners() {
        // Set availability button
        const setAvailabilityBtn = document.getElementById('setAvailabilityBtn');
        if (setAvailabilityBtn) {
            setAvailabilityBtn.addEventListener('click', () => this.showAvailabilityModal());
        }
    }

    // Load teacher appointments
    async loadTeacherAppointments() {
        try {
            const appointmentRequests = document.getElementById('appointmentRequests');
            if (!appointmentRequests) return;

            const appointmentsQuery = query(
                collection(db, 'appointments'),
                where('teacherId', '==', this.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(appointmentsQuery);
            const appointments = [];
            
            querySnapshot.forEach((doc) => {
                appointments.push({ id: doc.id, ...doc.data() });
            });

            this.renderTeacherAppointments(appointments);
            logger.logDatabase('READ', 'appointments', null, { teacherId: this.currentUser.uid });
            
        } catch (error) {
            logger.logError(error, 'Loading teacher appointments');
        }
    }

    // Render teacher appointments
    renderTeacherAppointments(appointments) {
        const container = document.getElementById('appointmentRequests');
        if (!container) return;

        const appointmentsHTML = appointments.length > 0 ? 
            appointments.map(appointment => `
                <div class="card">
                    <div class="card-header">
                        <h4>${appointment.studentName}</h4>
                        <span class="status status-${appointment.status}">${appointment.status}</span>
                    </div>
                    <div class="card-content">
                        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${appointment.time}</p>
                        <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                        ${appointment.message ? `<p><strong>Message:</strong> ${appointment.message}</p>` : ''}
                        
                        ${appointment.status === 'pending' ? `
                            <div class="appointment-actions" style="margin-top: 1rem;">
                                <button class="btn btn-success" onclick="app.approveAppointment('${appointment.id}')">
                                    <i class="fas fa-check"></i> Approve
                                </button>
                                <button class="btn btn-danger" onclick="app.cancelAppointment('${appointment.id}')">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('') : '<p>No appointment requests found.</p>';

        container.innerHTML = appointmentsHTML;
    }

    // Approve appointment
    async approveAppointment(appointmentId) {
        try {
            await updateDoc(doc(db, 'appointments', appointmentId), {
                status: 'approved',
                approvedAt: new Date().toISOString()
            });
            
            this.showNotification('Appointment approved', 'success');
            this.loadTeacherAppointments();
            
            logger.logDatabase('UPDATE', 'appointments', appointmentId, { action: 'approve' });
            
        } catch (error) {
            logger.logError(error, 'Approving appointment');
            this.showNotification('Error approving appointment', 'error');
        }
    }

    // Cancel appointment
    async cancelAppointment(appointmentId) {
        try {
            await updateDoc(doc(db, 'appointments', appointmentId), {
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });
            
            this.showNotification('Appointment cancelled', 'success');
            this.loadTeacherAppointments();
            
            logger.logDatabase('UPDATE', 'appointments', appointmentId, { action: 'cancel' });
            
        } catch (error) {
            logger.logError(error, 'Cancelling appointment');
            this.showNotification('Error cancelling appointment', 'error');
        }
    }

    // Student Dashboard Handlers
    setupStudentHandlers() {
        setTimeout(() => {
            this.loadTeachersForStudent();
            this.loadStudentAppointments();
            this.setupStudentEventListeners();
        }, 100);
    }

    setupStudentEventListeners() {
        // Search functionality
        const teacherSearch = document.getElementById('teacherSearch');
        const departmentFilter = document.getElementById('departmentFilter');
        
        if (teacherSearch) {
            teacherSearch.addEventListener('input', () => this.filterTeachers());
        }
        
        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => this.filterTeachers());
        }

        // Compose message button
        const composeMessageBtn = document.getElementById('composeMessageBtn');
        if (composeMessageBtn) {
            composeMessageBtn.addEventListener('click', () => this.showComposeMessageModal());
        }
    }

    // Load teachers for student search
    async loadTeachersForStudent() {
        try {
            const teachersQuery = query(
                collection(db, 'users'),
                where('role', '==', 'teacher'),
                where('status', '==', 'approved'),
                orderBy('name')
            );

            const querySnapshot = await getDocs(teachersQuery);
            this.allTeachers = [];
            
            querySnapshot.forEach((doc) => {
                this.allTeachers.push({ id: doc.id, ...doc.data() });
            });

            this.renderTeachersGrid(this.allTeachers);
            logger.logDatabase('READ', 'users', null, { filter: 'approved_teachers' });
            
        } catch (error) {
            logger.logError(error, 'Loading teachers for student');
        }
    }

    // Render teachers grid for students
    renderTeachersGrid(teachers) {
        const teachersGrid = document.getElementById('teachersGrid');
        if (!teachersGrid) return;

        const gridHTML = teachers.length > 0 ?
            `<div class="grid grid-3">
                ${teachers.map(teacher => `
                    <div class="card">
                        <div class="card-header">
                            <h4>${teacher.name}</h4>
                            <span class="status status-approved">Available</span>
                        </div>
                        <div class="card-content">
                            <p><strong>Department:</strong> ${teacher.department}</p>
                            <p><strong>Subject:</strong> ${teacher.subject}</p>
                            <p><strong>Office Hours:</strong> ${teacher.officeHours || 'By appointment'}</p>
                            <div style="margin-top: 1rem;">
                                <button class="btn btn-primary" onclick="app.bookAppointment('${teacher.id}', '${teacher.name}')">
                                    <i class="fas fa-calendar-plus"></i> Book Appointment
                                </button>
                                <button class="btn btn-secondary" onclick="app.sendMessage('${teacher.id}', '${teacher.name}')">
                                    <i class="fas fa-envelope"></i> Send Message
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>` : '<p>No teachers found.</p>';

        teachersGrid.innerHTML = gridHTML;
    }

    // Filter teachers based on search and department
    filterTeachers() {
        const searchTerm = document.getElementById('teacherSearch')?.value.toLowerCase() || '';
        const selectedDepartment = document.getElementById('departmentFilter')?.value || '';

        let filteredTeachers = this.allTeachers || [];

        if (searchTerm) {
            filteredTeachers = filteredTeachers.filter(teacher =>
                teacher.name.toLowerCase().includes(searchTerm) ||
                teacher.subject.toLowerCase().includes(searchTerm)
            );
        }

        if (selectedDepartment) {
            filteredTeachers = filteredTeachers.filter(teacher =>
                teacher.department === selectedDepartment
            );
        }

        this.renderTeachersGrid(filteredTeachers);
        logger.logUserAction('Teachers filtered', { searchTerm, selectedDepartment, resultCount: filteredTeachers.length });
    }

    // Book appointment with teacher
    async bookAppointment(teacherId, teacherName) {
        this.showBookingModal(teacherId, teacherName);
    }

    // Show booking modal
    showBookingModal(teacherId, teacherName) {
        const modalHTML = `
            <div class="modal active" id="bookingModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Book Appointment with ${teacherName}</h3>
                        <button class="modal-close" onclick="app.closeModal('bookingModal')">&times;</button>
                    </div>
                    <form id="bookingForm">
                        <div class="form-group">
                            <label for="appointmentDate">Date</label>
                            <input type="date" id="appointmentDate" required min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label for="appointmentTime">Time</label>
                            <select id="appointmentTime" required>
                                <option value="">Select Time</option>
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
                            <label for="appointmentPurpose">Purpose</label>
                            <select id="appointmentPurpose" required>
                                <option value="">Select Purpose</option>
                                <option value="Academic Consultation">Academic Consultation</option>
                                <option value="Project Discussion">Project Discussion</option>
                                <option value="Doubt Clarification">Doubt Clarification</option>
                                <option value="Career Guidance">Career Guidance</option>
                                <option value="Research Discussion">Research Discussion</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="appointmentMessage">Additional Message (Optional)</label>
                            <textarea id="appointmentMessage" rows="3" placeholder="Any additional information..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Book Appointment</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAppointmentBooking(teacherId, teacherName);
        });
    }

    // Submit appointment booking
    async submitAppointmentBooking(teacherId, teacherName) {
        try {
            const studentDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            const studentData = studentDoc.data();

            const appointmentData = {
                teacherId,
                teacherName,
                studentId: this.currentUser.uid,
                studentName: studentData.name,
                studentEmail: studentData.email,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                purpose: document.getElementById('appointmentPurpose').value,
                message: document.getElementById('appointmentMessage').value,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'appointments'), appointmentData);
            
            this.showNotification('Appointment booked successfully!', 'success');
            this.closeModal('bookingModal');
            this.loadStudentAppointments();
            
            logger.logDatabase('CREATE', 'appointments', null, appointmentData);
            logger.logUserAction('Appointment booked', { teacherId, teacherName });
            
        } catch (error) {
            logger.logError(error, 'Booking appointment');
            this.showNotification('Error booking appointment', 'error');
        }
    }

    // Load student appointments
    async loadStudentAppointments() {
        try {
            const myAppointments = document.getElementById('myAppointments');
            if (!myAppointments) return;

            const appointmentsQuery = query(
                collection(db, 'appointments'),
                where('studentId', '==', this.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(appointmentsQuery);
            const appointments = [];
            
            querySnapshot.forEach((doc) => {
                appointments.push({ id: doc.id, ...doc.data() });
            });

            this.renderStudentAppointments(appointments);
            logger.logDatabase('READ', 'appointments', null, { studentId: this.currentUser.uid });
            
        } catch (error) {
            logger.logError(error, 'Loading student appointments');
        }
    }

    // Render student appointments
    renderStudentAppointments(appointments) {
        const container = document.getElementById('myAppointments');
        if (!container) return;

        const appointmentsHTML = appointments.length > 0 ?
            appointments.map(appointment => `
                <div class="card">
                    <div class="card-header">
                        <h4>Appointment with ${appointment.teacherName}</h4>
                        <span class="status status-${appointment.status}">${appointment.status}</span>
                    </div>
                    <div class="card-content">
                        <p><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${appointment.time}</p>
                        <p><strong>Purpose:</strong> ${appointment.purpose}</p>
                        ${appointment.message ? `<p><strong>Message:</strong> ${appointment.message}</p>` : ''}
                        <p><strong>Booked on:</strong> ${new Date(appointment.createdAt).toLocaleDateString()}</p>
                        
                        ${appointment.status === 'pending' ? `
                            <button class="btn btn-danger" onclick="app.cancelStudentAppointment('${appointment.id}')">
                                <i class="fas fa-times"></i> Cancel Appointment
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('') : '<p>No appointments found.</p>';

        container.innerHTML = appointmentsHTML;
    }

    // Cancel student appointment
    async cancelStudentAppointment(appointmentId) {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            await updateDoc(doc(db, 'appointments', appointmentId), {
                status: 'cancelled',
                cancelledAt: new Date().toISOString(),
                cancelledBy: 'student'
            });
            
            this.showNotification('Appointment cancelled', 'success');
            this.loadStudentAppointments();
            
            logger.logDatabase('UPDATE', 'appointments', appointmentId, { action: 'cancel_by_student' });
            
        } catch (error) {
            logger.logError(error, 'Cancelling appointment');
            this.showNotification('Error cancelling appointment', 'error');
        }
    }

    // Utility functions
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    showNotification(message, type = 'info') {
        authManager.showNotification(message, type);
    }

    // Load teacher messages (for teacher dashboard)
    async loadTeacherMessages() {
        try {
            const messagesView = document.getElementById('messagesView');
            if (!messagesView) return;

            const messagesQuery = query(
                collection(db, 'messages'),
                where('receiverId', '==', this.currentUser.uid),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(messagesQuery);
            const messages = [];
            
            querySnapshot.forEach((doc) => {
                messages.push({ id: doc.id, ...doc.data() });
            });

            this.renderMessages(messages, 'teacher');
            
        } catch (error) {
            logger.logError(error, 'Loading teacher messages');
        }
    }

    // Render messages
    renderMessages(messages, userType) {
        const container = document.getElementById('messagesView');
        if (!container) return;

        const messagesHTML = messages.length > 0 ?
            messages.map(message => `
                <div class="card">
                    <div class="card-header">
                        <h4>From: ${message.senderName}</h4>
                        <small>${new Date(message.createdAt).toLocaleString()}</small>
                    </div>
                    <div class="card-content">
                        <p><strong>Subject:</strong> ${message.subject}</p>
                        <p>${message.content}</p>
                        ${userType === 'teacher' ? `
                            <button class="btn btn-primary" onclick="app.replyToMessage('${message.id}', '${message.senderName}')">
                                <i class="fas fa-reply"></i> Reply
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('') : '<p>No messages found.</p>';

        container.innerHTML = messagesHTML;
    }

    // Send message to teacher
    sendMessage(teacherId, teacherName) {
        this.showComposeMessageModal(teacherId, teacherName);
    }

    // Show compose message modal
    showComposeMessageModal(teacherId = null, teacherName = null) {
        const modalHTML = `
            <div class="modal active" id="messageModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${teacherId ? `Send Message to ${teacherName}` : 'Compose Message'}</h3>
                        <button class="modal-close" onclick="app.closeModal('messageModal')">&times;</button>
                    </div>
                    <form id="messageForm">
                        ${!teacherId ? `
                            <div class="form-group">
                                <label for="messageTeacher">Select Teacher</label>
                                <select id="messageTeacher" required>
                                    <option value="">Select Teacher</option>
                                    ${(this.allTeachers || []).map(teacher => 
                                        `<option value="${teacher.id}">${teacher.name} - ${teacher.department}</option>`
                                    ).join('')}
                                </select>
                            </div>
                        ` : `<input type="hidden" id="messageTeacher" value="${teacherId}">`}
                        
                        <div class="form-group">
                            <label for="messageSubject">Subject</label>
                            <input type="text" id="messageSubject" required placeholder="Enter subject">
                        </div>
                        <div class="form-group">
                            <label for="messageContent">Message</label>
                            <textarea id="messageContent" rows="5" required placeholder="Type your message here..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-full">Send Message</button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('messageForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitMessage();
        });
    }

    // Submit message
    async submitMessage() {
        try {
            const studentDoc = await getDoc(doc(db, 'users', this.currentUser.uid));
            const studentData = studentDoc.data();
            
            const receiverId = document.getElementById('messageTeacher').value;
            const subject = document.getElementById('messageSubject').value;
            const content = document.getElementById('messageContent').value;

            // Get teacher name
            const teacherDoc = await getDoc(doc(db, 'users', receiverId));
            const teacherData = teacherDoc.data();

            const messageData = {
                senderId: this.currentUser.uid,
                senderName: studentData.name,
                senderEmail: studentData.email,
                receiverId,
                receiverName: teacherData.name,
                subject,
                content,
                createdAt: new Date().toISOString(),
                read: false
            };

            await addDoc(collection(db, 'messages'), messageData);
            
            this.showNotification('Message sent successfully!', 'success');
            this.closeModal('messageModal');
            
            logger.logDatabase('CREATE', 'messages', null, messageData);
            logger.logUserAction('Message sent', { receiverId, subject });
            
        } catch (error) {
            logger.logError(error, 'Sending message');
            this.showNotification('Error sending message', 'error');
        }
    }
}

// Create global app instance
const app = new AppManager();

// Make app available globally for onclick handlers
window.app = app;

logger.info('Application module loaded');

export default app;
