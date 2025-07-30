# Student-Teacher Booking System - Test Cases

## 1. Test Overview

This document contains comprehensive test cases for the Student-Teacher Booking Appointment System, covering functional, non-functional, security, and usability testing scenarios.

## 2. Test Strategy

### 2.1 Testing Scope
- **Functional Testing**: Core features and business logic
- **Integration Testing**: Firebase services integration
- **Security Testing**: Authentication and authorization
- **Usability Testing**: User experience and accessibility
- **Performance Testing**: Load and stress testing
- **Compatibility Testing**: Cross-browser and device testing

### 2.2 Test Environment
- **Browsers**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, Tablet, Mobile
- **Operating Systems**: Windows, macOS, iOS, Android
- **Network Conditions**: High-speed, 3G, Offline

## 3. Functional Test Cases

### 3.1 User Authentication

#### TC_AUTH_001: User Registration - Student
**Objective**: Verify student registration functionality
**Preconditions**: User is on registration page
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to registration page | Registration form is displayed |
| 2 | Enter valid name "John Student" | Name field accepts input |
| 3 | Enter valid email "john@student.edu" | Email field accepts input |
| 4 | Enter valid password "password123" | Password field accepts input |
| 5 | Select role "Student" | Student-specific fields appear |
| 6 | Enter student ID "STU2024001" | Student ID field accepts input |
| 7 | Select year "2nd Year" | Year selection is saved |
| 8 | Click "Register" button | User is registered and redirected to dashboard |

**Expected Outcome**: Student account is created with approved status

#### TC_AUTH_002: User Registration - Teacher
**Objective**: Verify teacher registration functionality
**Preconditions**: User is on registration page
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to registration page | Registration form is displayed |
| 2 | Enter valid name "Dr. Jane Teacher" | Name field accepts input |
| 3 | Enter valid email "jane@university.edu" | Email field accepts input |
| 4 | Enter valid password "password123" | Password field accepts input |
| 5 | Select role "Teacher" | Teacher-specific fields appear |
| 6 | Select department "Computer Science" | Department is selected |
| 7 | Enter subject "Data Structures" | Subject field accepts input |
| 8 | Enter office hours "Mon-Fri 9-5" | Office hours field accepts input |
| 9 | Click "Register" button | User is registered with pending status |

**Expected Outcome**: Teacher account is created with pending status, requiring admin approval

#### TC_AUTH_003: User Login - Valid Credentials
**Objective**: Verify login with valid credentials
**Preconditions**: User has valid account
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to login page | Login form is displayed |
| 2 | Enter valid email | Email field accepts input |
| 3 | Enter valid password | Password field accepts input |
| 4 | Select correct role | Role is selected |
| 5 | Click "Login" button | User is authenticated and redirected to dashboard |

**Expected Outcome**: User successfully logs in and sees appropriate dashboard

#### TC_AUTH_004: User Login - Invalid Credentials
**Objective**: Verify login with invalid credentials
**Preconditions**: User is on login page
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to login page | Login form is displayed |
| 2 | Enter invalid email "wrong@email.com" | Email field accepts input |
| 3 | Enter incorrect password "wrongpass" | Password field accepts input |
| 4 | Select role "Student" | Role is selected |
| 5 | Click "Login" button | Error message is displayed |

**Expected Outcome**: Login fails with appropriate error message

#### TC_AUTH_005: Password Validation
**Objective**: Verify password validation rules
**Preconditions**: User is on registration page
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to registration page | Registration form is displayed |
| 2 | Enter password "123" (less than 6 chars) | Validation error is shown |
| 3 | Enter password "password123" (valid) | No validation error |

**Expected Outcome**: Password validation works correctly

### 3.2 Teacher Management (Admin)

#### TC_ADMIN_001: Approve Teacher Registration
**Objective**: Verify admin can approve teacher registrations
**Preconditions**: Admin is logged in, pending teacher exists
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to admin dashboard | Admin dashboard is displayed |
| 2 | Click "Manage Teachers" tab | Teachers list is displayed |
| 3 | Locate pending teacher | Teacher with "Pending" status is visible |
| 4 | Click "Approve" button | Approval confirmation is requested |
| 5 | Confirm approval | Teacher status changes to "Approved" |

**Expected Outcome**: Teacher can now log in and access teacher dashboard

#### TC_ADMIN_002: Delete Teacher Account
**Objective**: Verify admin can delete teacher accounts
**Preconditions**: Admin is logged in, teacher account exists
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to admin dashboard | Admin dashboard is displayed |
| 2 | Click "Manage Teachers" tab | Teachers list is displayed |
| 3 | Locate teacher to delete | Teacher is visible in list |
| 4 | Click "Delete" button | Deletion confirmation is requested |
| 5 | Confirm deletion | Teacher is removed from list |

**Expected Outcome**: Teacher account is permanently deleted

#### TC_ADMIN_003: Add New Teacher
**Objective**: Verify admin can manually add teacher accounts
**Preconditions**: Admin is logged in
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to admin dashboard | Admin dashboard is displayed |
| 2 | Click "Manage Teachers" tab | Teachers list is displayed |
| 3 | Click "Add Teacher" button | Teacher creation form appears |
| 4 | Fill all required fields | Form accepts valid input |
| 5 | Click "Save" button | Teacher is added to list |

**Expected Outcome**: New teacher account is created with approved status

### 3.3 Appointment Booking (Student)

#### TC_BOOKING_001: Search Teachers
**Objective**: Verify student can search for teachers
**Preconditions**: Student is logged in, approved teachers exist
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to student dashboard | Student dashboard is displayed |
| 2 | Click "Find Teachers" tab | Teacher search page is displayed |
| 3 | Enter search term "Computer" | Search input accepts text |
| 4 | Press Enter or click search | Filtered results are displayed |

**Expected Outcome**: Only teachers matching search criteria are shown

#### TC_BOOKING_002: Filter Teachers by Department
**Objective**: Verify department filtering functionality
**Preconditions**: Student is logged in, teachers from multiple departments exist
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to teacher search page | Teacher search page is displayed |
| 2 | Select "Computer Science" from department filter | Filter is applied |
| 3 | Verify results | Only Computer Science teachers are shown |
| 4 | Select "All Departments" | All teachers are shown again |

**Expected Outcome**: Filtering works correctly for all departments

#### TC_BOOKING_003: Book Appointment with Teacher
**Objective**: Verify student can book appointment with teacher
**Preconditions**: Student is logged in, approved teacher exists
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to teacher search page | Teacher search page is displayed |
| 2 | Click "Book Appointment" on teacher card | Booking modal opens |
| 3 | Select future date | Date is selected |
| 4 | Select available time slot | Time is selected |
| 5 | Select purpose "Academic Consultation" | Purpose is selected |
| 6 | Enter optional message | Message is entered |
| 7 | Click "Book Appointment" | Appointment is created |

**Expected Outcome**: Appointment is booked with "Pending" status

#### TC_BOOKING_004: Book Appointment - Past Date
**Objective**: Verify system prevents booking appointments in the past
**Preconditions**: Student is logged in, approved teacher exists
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to teacher search page | Teacher search page is displayed |
| 2 | Click "Book Appointment" on teacher card | Booking modal opens |
| 3 | Try to select past date | Past dates are disabled |
| 4 | Select today's date | Current date is selectable |

**Expected Outcome**: Only current and future dates are selectable

#### TC_BOOKING_005: View My Appointments
**Objective**: Verify student can view their appointments
**Preconditions**: Student is logged in, student has booked appointments
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to student dashboard | Student dashboard is displayed |
| 2 | Click "My Appointments" tab | Appointments list is displayed |
| 3 | Verify appointment details | All appointment details are shown |
| 4 | Check appointment status | Status is correctly displayed |

**Expected Outcome**: All student's appointments are listed with correct details

#### TC_BOOKING_006: Cancel Pending Appointment
**Objective**: Verify student can cancel pending appointments
**Preconditions**: Student is logged in, student has pending appointment
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to "My Appointments" | Appointments list is displayed |
| 2 | Locate pending appointment | Pending appointment is visible |
| 3 | Click "Cancel Appointment" button | Cancellation confirmation is requested |
| 4 | Confirm cancellation | Appointment status changes to "Cancelled" |

**Expected Outcome**: Appointment is cancelled and teacher is notified

### 3.4 Appointment Management (Teacher)

#### TC_TEACHER_001: View Appointment Requests
**Objective**: Verify teacher can view appointment requests
**Preconditions**: Teacher is logged in, appointment requests exist
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to teacher dashboard | Teacher dashboard is displayed |
| 2 | Click "Appointments" tab | Appointment requests are displayed |
| 3 | Verify request details | All request details are shown |

**Expected Outcome**: All appointment requests are visible with student details

#### TC_TEACHER_002: Approve Appointment Request
**Objective**: Verify teacher can approve appointment requests
**Preconditions**: Teacher is logged in, pending appointment request exists
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to appointments page | Appointment requests are displayed |
| 2 | Locate pending request | Pending request is visible |
| 3 | Click "Approve" button | Appointment is approved |
| 4 | Verify status change | Status changes to "Approved" |

**Expected Outcome**: Appointment is approved and student is notified

#### TC_TEACHER_003: Cancel Appointment Request
**Objective**: Verify teacher can cancel appointment requests
**Preconditions**: Teacher is logged in, pending appointment request exists
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to appointments page | Appointment requests are displayed |
| 2 | Locate pending request | Pending request is visible |
| 3 | Click "Cancel" button | Cancellation confirmation is requested |
| 4 | Confirm cancellation | Appointment status changes to "Cancelled" |

**Expected Outcome**: Appointment is cancelled and student is notified

### 3.5 Messaging System

#### TC_MSG_001: Student Send Message to Teacher
**Objective**: Verify student can send messages to teachers
**Preconditions**: Student is logged in, approved teacher exists
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to teacher search page | Teacher search page is displayed |
| 2 | Click "Send Message" on teacher card | Message composition modal opens |
| 3 | Enter subject "Question about assignment" | Subject is entered |
| 4 | Enter message content | Message content is entered |
| 5 | Click "Send Message" | Message is sent successfully |

**Expected Outcome**: Message is delivered to teacher's inbox

#### TC_MSG_002: Teacher View Messages
**Objective**: Verify teacher can view received messages
**Preconditions**: Teacher is logged in, messages exist
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to teacher dashboard | Teacher dashboard is displayed |
| 2 | Click "Messages" tab | Messages are displayed |
| 3 | Verify message details | All message details are shown |

**Expected Outcome**: All received messages are visible with sender details

#### TC_MSG_003: Teacher Reply to Message
**Objective**: Verify teacher can reply to student messages
**Preconditions**: Teacher is logged in, message from student exists
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to messages page | Messages are displayed |
| 2 | Click "Reply" on a message | Reply composition modal opens |
| 3 | Enter reply content | Reply content is entered |
| 4 | Click "Send Reply" | Reply is sent successfully |

**Expected Outcome**: Reply is delivered to student's inbox

## 4. Security Test Cases

### 4.1 Authentication Security

#### TC_SEC_001: SQL Injection Prevention
**Objective**: Verify system is protected against SQL injection
**Preconditions**: User is on login page
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter malicious SQL in email field | Input is sanitized |
| 2 | Enter SQL injection in password field | Input is sanitized |
| 3 | Attempt login | Login fails safely without errors |

**Expected Outcome**: System rejects malicious input without revealing errors

#### TC_SEC_002: XSS Prevention
**Objective**: Verify system prevents cross-site scripting attacks
**Preconditions**: User can input text (messages, forms)
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter script tag in message field | Script is escaped or removed |
| 2 | Submit form with malicious content | Content is sanitized |
| 3 | View the saved content | No script execution occurs |

**Expected Outcome**: Malicious scripts are prevented from executing

#### TC_SEC_003: Session Management
**Objective**: Verify proper session handling
**Preconditions**: User is logged in
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in successfully | Session is established |
| 2 | Close browser and reopen | Session persists appropriately |
| 3 | Log out explicitly | Session is properly terminated |
| 4 | Try to access protected pages | Access is denied |

**Expected Outcome**: Sessions are managed securely

### 4.2 Authorization Security

#### TC_SEC_004: Role-Based Access Control
**Objective**: Verify users can only access appropriate features
**Preconditions**: Users with different roles exist
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as student | Student dashboard is shown |
| 2 | Try to access admin URLs directly | Access is denied |
| 3 | Log in as teacher | Teacher dashboard is shown |
| 4 | Try to access admin functions | Access is denied |
| 5 | Log in as admin | All features are accessible |

**Expected Outcome**: Role-based access is properly enforced

#### TC_SEC_005: Data Privacy
**Objective**: Verify users can only see their own data
**Preconditions**: Multiple users with data exist
**Priority**: High

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as Student A | Only Student A's data is visible |
| 2 | Log in as Teacher B | Only Teacher B's data is visible |
| 3 | Try to access other users' data | Access is denied |

**Expected Outcome**: Data isolation is maintained between users

## 5. Performance Test Cases

### 5.1 Load Testing

#### TC_PERF_001: Concurrent User Login
**Objective**: Verify system handles multiple concurrent logins
**Test Data**: 50 concurrent users
**Priority**: Medium

| Metric | Expected Value |
|--------|----------------|
| Response Time | < 3 seconds |
| Success Rate | > 95% |
| Error Rate | < 5% |

#### TC_PERF_002: Appointment Booking Load
**Objective**: Verify system handles multiple concurrent bookings
**Test Data**: 25 concurrent booking requests
**Priority**: Medium

| Metric | Expected Value |
|--------|----------------|
| Response Time | < 5 seconds |
| Success Rate | > 90% |
| Data Consistency | 100% |

### 5.2 Stress Testing

#### TC_PERF_003: Database Query Performance
**Objective**: Verify database performs well under load
**Test Data**: 1000 teacher records, 5000 appointment records
**Priority**: Low

| Operation | Expected Time |
|-----------|---------------|
| Teacher Search | < 2 seconds |
| Appointment Retrieval | < 3 seconds |
| Complex Queries | < 5 seconds |

## 6. Usability Test Cases

### 6.1 User Experience

#### TC_UX_001: Navigation Usability
**Objective**: Verify intuitive navigation
**Preconditions**: User is on any page
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Look for main navigation | Navigation is clearly visible |
| 2 | Click navigation items | Pages load as expected |
| 3 | Use breadcrumbs (if available) | Navigation history is clear |

**Expected Outcome**: Users can navigate easily without confusion

#### TC_UX_002: Form Usability
**Objective**: Verify forms are user-friendly
**Preconditions**: User is on form page
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View form fields | Labels are clear and descriptive |
| 2 | Fill form with errors | Validation messages are helpful |
| 3 | Submit valid form | Success feedback is provided |

**Expected Outcome**: Forms are intuitive and provide good feedback

### 6.2 Accessibility Testing

#### TC_ACC_001: Screen Reader Compatibility
**Objective**: Verify compatibility with screen readers
**Tools**: NVDA/JAWS screen reader
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate with screen reader | All content is readable |
| 2 | Use form elements | Labels are properly announced |
| 3 | Navigate buttons/links | Purpose is clearly communicated |

**Expected Outcome**: Site is fully accessible to screen reader users

#### TC_ACC_002: Keyboard Navigation
**Objective**: Verify full keyboard navigation support
**Preconditions**: User has no mouse access
**Priority**: Medium

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate using Tab key | Logical tab order is followed |
| 2 | Activate buttons with Enter/Space | All interactive elements work |
| 3 | Navigate forms with keyboard | All fields are accessible |

**Expected Outcome**: Complete functionality is available via keyboard

## 7. Compatibility Test Cases

### 7.1 Browser Compatibility

#### TC_COMPAT_001: Cross-Browser Testing
**Objective**: Verify functionality across different browsers
**Browsers**: Chrome, Firefox, Safari, Edge
**Priority**: High

| Browser | Login | Booking | Messages | Dashboard |
|---------|-------|---------|----------|-----------|
| Chrome  | ✓     | ✓       | ✓        | ✓         |
| Firefox | ✓     | ✓       | ✓        | ✓         |
| Safari  | ✓     | ✓       | ✓        | ✓         |
| Edge    | ✓     | ✓       | ✓        | ✓         |

**Expected Outcome**: All features work consistently across browsers

### 7.2 Device Compatibility

#### TC_COMPAT_002: Mobile Responsiveness
**Objective**: Verify responsive design on mobile devices
**Devices**: iPhone, Android phones, tablets
**Priority**: High

| Device Type | Layout | Touch | Navigation | Forms |
|-------------|--------|-------|------------|-------|
| Phone       | ✓      | ✓     | ✓          | ✓     |
| Tablet      | ✓      | ✓     | ✓          | ✓     |
| Desktop     | ✓      | N/A   | ✓          | ✓     |

**Expected Outcome**: Site is fully functional on all device types

## 8. Test Execution Guidelines

### 8.1 Test Environment Setup
1. **Database**: Use test Firebase project with sample data
2. **Users**: Create test accounts for each role
3. **Data**: Populate with realistic test data
4. **Tools**: Browser dev tools, accessibility tools, performance monitors

### 8.2 Test Data Management
- **Students**: At least 10 test student accounts
- **Teachers**: At least 5 test teacher accounts (approved and pending)
- **Admin**: At least 1 admin account
- **Appointments**: Various states (pending, approved, cancelled)
- **Messages**: Sample communications between users

### 8.3 Bug Reporting Template
```
Bug ID: BUG_XXX_001
Title: [Brief description]
Priority: High/Medium/Low
Severity: Critical/Major/Minor
Browser/Device: [Browser name and version]
Steps to Reproduce:
1. Step 1
2. Step 2
3. Step 3
Expected Result: [What should happen]
Actual Result: [What actually happened]
Screenshots: [If applicable]
Additional Notes: [Any other relevant information]
```

### 8.4 Test Execution Report Template
```
Test Case ID: TC_XXX_001
Test Case Name: [Test case name]
Execution Date: [Date]
Tester: [Tester name]
Status: Pass/Fail/Blocked
Execution Time: [Duration]
Notes: [Any observations]
Defects Found: [List of bugs if any]
```

## 9. Automated Testing Considerations

### 9.1 Unit Testing
- **Framework**: Jest for JavaScript
- **Coverage**: Aim for 80%+ code coverage
- **Focus**: Business logic, validation functions, utilities

### 9.2 Integration Testing
- **Firebase**: Test Firebase service integration
- **API**: Test all Firebase operations
- **Authentication**: Test auth flows

### 9.3 E2E Testing
- **Framework**: Cypress or Playwright
- **Scenarios**: Critical user journeys
- **Schedule**: Run with each deployment

### 9.4 Performance Testing
- **Tools**: Lighthouse, WebPageTest
- **Metrics**: Load time, Core Web Vitals
- **Frequency**: Weekly performance monitoring

## 10. Test Metrics and KPIs

### 10.1 Quality Metrics
- **Test Coverage**: > 80%
- **Pass Rate**: > 95%
- **Defect Density**: < 5 defects per 1000 lines of code
- **Defect Resolution Time**: < 48 hours for critical bugs

### 10.2 Performance Metrics
- **Page Load Time**: < 3 seconds
- **Time to Interactive**: < 5 seconds
- **First Contentful Paint**: < 2 seconds
- **Cumulative Layout Shift**: < 0.1

### 10.3 User Experience Metrics
- **Task Completion Rate**: > 90%
- **User Error Rate**: < 5%
- **Accessibility Score**: > 95%
- **Cross-browser Compatibility**: 100%

---

This comprehensive test suite ensures the Student-Teacher Booking System meets all functional, security, performance, and usability requirements while maintaining high quality standards.
