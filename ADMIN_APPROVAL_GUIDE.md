# 👨‍💼 Admin Approval Process Guide

## How Teacher Registration Approval Works

### Overview
When teachers register, their accounts are created with "pending" status and require admin approval before they can login and use the system.

### Step-by-Step Process

#### 1. Setup Admin Account (One-time)
- Open `admin-setup.html` in your browser
- Fill in admin details or use the default ones:
  - **Email:** admin@university.edu
  - **Password:** admin123
- Click "Create Admin Account"

#### 2. Teacher Registration Flow
1. Teacher goes to main app (`index.html`)
2. Clicks "Don't have an account? Register here"
3. Selects "Teacher" as role
4. Fills in their information and submits
5. Account is created with status "pending"
6. Teacher **cannot login** until approved

#### 3. Admin Approval Process
1. **Admin Login:**
   - Go to main app (`index.html`)
   - Login with admin credentials
   - Select "Admin" role
   - Click "Login"

2. **Access Admin Dashboard:**
   - After login, admin sees the Admin Dashboard
   - Dashboard shows system overview and management options

3. **Approve Teachers:**
   - Click on "Teachers" section in dashboard
   - See table of all teachers with columns:
     - Name
     - Email
     - Subject (for teachers)
     - Status (pending/approved)
     - Actions
   - Find teachers with "pending" status
   - Click "Approve" button next to their name
   - Status changes to "approved"

4. **Teacher Can Now Login:**
   - Teacher can now login successfully
   - They get access to teacher dashboard
   - Can set availability and manage appointments

### Admin Dashboard Features

#### Teachers Management
- ✅ **Approve pending registrations**
- ✏️ **Edit teacher information**
- 🗑️ **Delete teacher accounts**
- 📊 **View teacher status overview**

#### System Overview
- 📊 **Total users statistics**
- 📅 **Recent appointments**
- ⏰ **Pending approvals count**

### Testing the Complete Flow

1. **Setup Admin:** Run `admin-setup.html` first
2. **Register Teacher:** Register a new teacher account
3. **Try Teacher Login:** Teacher login will fail (pending approval)
4. **Admin Login:** Login as admin
5. **Approve Teacher:** Use admin dashboard to approve
6. **Teacher Login Success:** Teacher can now login

### Default Admin Credentials
```
Email: admin@university.edu
Password: admin123
Role: Admin
```

### Troubleshooting

#### Teacher Can't Login After Registration
- Check if admin has approved the teacher
- Verify teacher is using correct credentials
- Ensure teacher selects "Teacher" role during login

#### Admin Dashboard Not Showing
- Verify admin role is selected during login
- Check if admin account was created properly
- Clear browser cache and try again

#### No Pending Teachers Visible
- Teachers only appear after they register
- Refresh the admin dashboard
- Check if teachers are already approved

### File Structure
```
admin-setup.html     → Create admin accounts
index.html          → Main application
js/auth.js          → Authentication + Admin Dashboard
js/app.js           → Admin approval functions
js/firebase-mock.js → Mock database system
```

### Admin Functions Available

#### In `js/app.js`:
- `approveTeacher(teacherId)` → Approve pending teacher
- `loadTeachersForAdmin()` → Load teachers list for admin
- `deleteUser(userId)` → Delete user account

#### In `js/auth.js`:
- Admin dashboard HTML generation
- Role-based access control
- Teacher approval UI rendering

This system ensures only verified teachers can access the platform while giving admins full control over user management! 🎯
