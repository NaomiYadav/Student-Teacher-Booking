# Student-Teacher Booking Appointment System

A comprehensive web-based appointment booking system that allows students to book appointments with teachers and enables teachers to manage their schedules efficiently.

## 🚀 Features

### For Students
- **Search Teachers**: Find teachers by name, department, or subject
- **Book Appointments**: Schedule meetings with preferred time slots
- **Send Messages**: Communicate directly with teachers
- **View Appointments**: Track all booked appointments and their status
- **Profile Management**: Update personal information

### For Teachers
- **Manage Schedule**: Set availability and office hours
- **Approve/Cancel Appointments**: Review and respond to appointment requests
- **View Messages**: Receive and reply to student messages
- **Dashboard Overview**: See all appointments and schedule at a glance

### For Admin
- **Teacher Management**: Add, approve, edit, and delete teacher accounts
- **Student Management**: Oversee student registrations
- **System Monitoring**: View all appointments and system logs
- **Analytics**: Track system usage and performance

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore Database)
- **Styling**: Custom CSS with responsive design
- **Icons**: Font Awesome
- **Logging**: Custom JavaScript logging system

## 📱 System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Firebase      │    │   External      │
│                 │    │   Services      │    │   Services      │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • HTML/CSS/JS   │◄──►│ • Authentication│    │ • Font Awesome  │
│ • Auth Manager  │    │ • Firestore DB  │    │ • CDN Services  │
│ • App Manager   │    │ • Hosting       │    │                 │
│ • Logger System │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema

#### Users Collection
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: "student" | "teacher" | "admin",
  status: "pending" | "approved",
  createdAt: timestamp,
  // Student-specific fields
  studentId?: string,
  yearOfStudy?: string,
  // Teacher-specific fields
  department?: string,
  subject?: string,
  officeHours?: string
}
```

#### Appointments Collection
```javascript
{
  teacherId: string,
  teacherName: string,
  studentId: string,
  studentName: string,
  date: string,
  time: string,
  purpose: string,
  message?: string,
  status: "pending" | "approved" | "cancelled" | "completed",
  createdAt: timestamp
}
```

#### Messages Collection
```javascript
{
  senderId: string,
  senderName: string,
  receiverId: string,
  receiverName: string,
  subject: string,
  content: string,
  read: boolean,
  createdAt: timestamp
}
```

## 🚀 Getting Started

### Prerequisites
- Web browser with JavaScript enabled
- Firebase account
- Internet connection

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Student-Teacher-Booking-.git
   cd Student-Teacher-Booking-
   ```

2. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Get your Firebase configuration

3. **Configure Firebase**
   - Open `js/firebase-config.js`
   - Replace the placeholder configuration with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null && 
           (resource.data.role == 'teacher' && resource.data.status == 'approved');
       }
       
       // Appointments
       match /appointments/{appointmentId} {
         allow read, write: if request.auth != null && 
           (request.auth.uid == resource.data.studentId || 
            request.auth.uid == resource.data.teacherId);
         allow create: if request.auth != null;
       }
       
       // Messages
       match /messages/{messageId} {
         allow read, write: if request.auth != null && 
           (request.auth.uid == resource.data.senderId || 
            request.auth.uid == resource.data.receiverId);
       }
       
       // Logs (admin only)
       match /logs/{logId} {
         allow write: if request.auth != null;
         allow read: if request.auth != null && 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

5. **Deploy to Firebase Hosting** (Optional)
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   firebase deploy
   ```

6. **Local Development**
   - Simply open `index.html` in a web browser
   - Or use a local server:
   ```bash
   python -m http.server 8000
   # Or use Live Server extension in VS Code
   ```

### Creating Admin Account

1. Register as a student or teacher first
2. Manually update the user's role to "admin" in Firestore console
3. Or use Firebase Admin SDK to create admin users programmatically

## 📋 Usage

### For Students

1. **Registration**
   - Click "Register" and fill in student details
   - Account is automatically approved

2. **Finding Teachers**
   - Use the search bar to find teachers by name or subject
   - Filter by department
   - View teacher profiles and availability

3. **Booking Appointments**
   - Click "Book Appointment" on teacher's card
   - Select date, time, and purpose
   - Add optional message
   - Submit booking request

4. **Managing Appointments**
   - View all appointments in "My Appointments"
   - Cancel pending appointments if needed
   - Track appointment status

### For Teachers

1. **Registration**
   - Register with teacher role and department info
   - Wait for admin approval

2. **Managing Appointments**
   - Review appointment requests
   - Approve or cancel requests
   - View appointment details and student messages

3. **Communication**
   - Receive messages from students
   - Reply to student inquiries
   - Set office hours and availability

### For Admin

1. **Teacher Management**
   - Approve pending teacher registrations
   - Edit teacher information
   - Remove teachers if necessary

2. **System Monitoring**
   - View all appointments across the system
   - Monitor system logs and user activities
   - Download logs for analysis

## 🧪 Testing

### Test Cases

#### Authentication Tests
- User registration with valid data
- User registration with invalid data
- Login with correct credentials
- Login with incorrect credentials
- Role-based access control
- Password validation

#### Appointment Tests
- Student can book appointment with approved teacher
- Teacher can approve/cancel appointments
- Appointment status updates correctly
- Duplicate appointment prevention
- Past date validation

#### Message Tests
- Student can send message to teacher
- Teacher can receive and reply to messages
- Message content validation
- Message delivery confirmation

#### Admin Tests
- Admin can approve teacher registrations
- Admin can view all system data
- Admin can delete users
- Admin access restrictions

### Running Tests

Since this is a client-side application, testing can be done through:

1. **Manual Testing**: Use the application interface
2. **Browser DevTools**: Check console logs and network requests
3. **Firebase Console**: Verify data integrity
4. **Automated Testing**: Can be added using tools like Cypress or Playwright

## 📊 Logging and Monitoring

The application includes comprehensive logging:

- **User Actions**: Login, registration, navigation
- **Database Operations**: CRUD operations with details
- **Error Tracking**: Automatic error capture and reporting
- **Performance Monitoring**: Track operation timing
- **Security Events**: Failed login attempts, unauthorized access

Logs are stored in:
- Browser localStorage (client-side logs)
- Firebase Firestore (server-side error logs)
- Browser console (development logs)

## 🔧 Configuration

### Environment Variables
Create environment-specific configurations:

```javascript
// config/development.js
export const config = {
  environment: 'development',
  debug: true,
  logLevel: 'DEBUG',
  maxLogEntries: 1000
};

// config/production.js
export const config = {
  environment: 'production',
  debug: false,
  logLevel: 'ERROR',
  maxLogEntries: 500
};
```

### Feature Flags
Enable/disable features based on environment:

```javascript
const features = {
  enableAdvancedSearch: true,
  enableVideoCall: false,
  enableNotifications: true,
  enableAnalytics: true
};
```

## 🚀 Deployment

### Firebase Hosting
```bash
firebase init hosting
firebase deploy
```

### Other Hosting Options
- Netlify
- Vercel
- GitHub Pages
- Traditional web hosting

## 🔒 Security Considerations

1. **Authentication**: Firebase Authentication handles secure login
2. **Authorization**: Firestore rules control data access
3. **Data Validation**: Client and server-side validation
4. **HTTPS**: Always use HTTPS in production
5. **Input Sanitization**: Prevent XSS attacks
6. **Rate Limiting**: Prevent abuse and spam

## 🎨 Customization

### Theming
Modify `css/style.css` to change:
- Color scheme
- Typography
- Layout
- Responsive breakpoints

### Adding Features
1. Create new modules in `js/` directory
2. Import and integrate with `app.js`
3. Update UI components
4. Add corresponding Firestore collections
5. Update security rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper logging
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check internet connection
   - Verify Firebase configuration
   - Check browser console for errors

2. **Authentication Issues**
   - Clear browser cache and localStorage
   - Check Firebase Authentication settings
   - Verify email/password requirements

3. **Permission Denied Errors**
   - Check Firestore security rules
   - Verify user authentication status
   - Ensure proper role assignments

4. **UI Not Loading**
   - Check browser compatibility
   - Disable browser extensions
   - Check console for JavaScript errors

### Support

For support and questions:
- Check the documentation
- Review console logs
- Create an issue on GitHub
- Contact the development team

## 🔄 Changelog

### Version 1.0.0 (Current)
- Initial release
- Basic appointment booking functionality
- User authentication and role management
- Responsive design
- Comprehensive logging system

### Planned Features
- Email notifications
- Calendar integration
- Video call support
- Mobile app
- Advanced analytics
- Multi-language support

---

**Built with ❤️ for educational institutions to streamline student-teacher interactions.**