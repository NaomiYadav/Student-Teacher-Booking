# Student-Teacher Booking System - Deployment Guide

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Student-Teacher-Booking-.git
   cd Student-Teacher-Booking-
   ```

2. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password method)
   - Create a Firestore database
   - Copy your Firebase configuration

3. **Configure the application**
   - Open `js/firebase-config.js`
   - Replace the placeholder configuration with your Firebase config

4. **Deploy to Firebase Hosting**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy
   ```

5. **Access your application**
   - Your app will be available at: `https://your-project-id.web.app`

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- Git
- Modern web browser
- Firebase account

### Local Development
```bash
# Install dependencies
npm install

# Start local development server
npm start

# Or use Firebase local emulator
firebase serve
```

## Firebase Configuration

### 1. Firebase Project Setup
```bash
# Initialize Firebase in your project
firebase init

# Select these features:
# - Firestore
# - Hosting
# - (Optional) Functions for advanced features
```

### 2. Update Firebase Config
Replace the configuration in `js/firebase-config.js`:
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

### 3. Set up Firestore Security Rules
The `firestore.rules` file is already configured. Deploy it with:
```bash
firebase deploy --only firestore:rules
```

### 4. Set up Firestore Indexes
Deploy the indexes with:
```bash
firebase deploy --only firestore:indexes
```

## Creating Admin Account

Since teacher registration requires admin approval, you'll need to create the first admin account manually:

1. **Register as a student first** (to create account)
2. **Update role in Firestore console**:
   - Go to Firebase Console > Firestore Database
   - Find your user document in the `users` collection
   - Change the `role` field from "student" to "admin"
   - Save the changes
3. **Log out and log back in** with admin role selected

## Production Deployment

### 1. Build Optimization
```bash
# Minify CSS and JS files
npm run build

# Lint JavaScript files
npm run lint

# Fix linting issues
npm run lint:fix
```

### 2. Environment Configuration
Create environment-specific configurations for production:

```javascript
// config/production.js
export const config = {
  environment: 'production',
  debug: false,
  logLevel: 'ERROR',
  enableAnalytics: true,
  maxLogEntries: 500
};
```

### 3. Firebase Hosting
```bash
# Deploy to production
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only firestore
```

### 4. Custom Domain (Optional)
```bash
# Add custom domain
firebase hosting:channel:deploy live --custom-domain yourdomain.com
```

## Environment Variables

For sensitive configuration, use environment variables:

```javascript
// js/config.js
const config = {
  apiKey: process.env.FIREBASE_API_KEY || 'default-key',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'default-domain',
  // ... other config
};
```

## Monitoring and Analytics

### 1. Firebase Analytics
Add to your HTML head:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Performance Monitoring
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-performance.js"></script>
```

### 3. Error Tracking
The application includes comprehensive error logging. Monitor errors in:
- Browser console (development)
- Firebase Firestore logs collection (production)

## Security Checklist

Before deployment, ensure:

- [ ] Firebase security rules are properly configured
- [ ] API keys are restricted to your domain
- [ ] HTTPS is enforced
- [ ] Input validation is implemented
- [ ] User data is properly sanitized
- [ ] Role-based access control is working
- [ ] Password requirements are enforced

## Performance Optimization

### 1. Enable Compression
Firebase Hosting automatically handles:
- Gzip compression
- Brotli compression
- Cache headers

### 2. Optimize Assets
```bash
# Optimize images
# Use WebP format for better compression
# Minimize CSS and JavaScript files
```

### 3. Implement Caching
The `firebase.json` configuration includes caching headers:
```json
{
  "headers": [
    {
      "source": "**/*.@(js|css|html)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "max-age=31536000"
        }
      ]
    }
  ]
}
```

## Testing Before Deployment

### 1. Manual Testing
- Test all user roles (student, teacher, admin)
- Verify appointment booking workflow
- Check message functionality
- Test responsive design on mobile devices

### 2. Performance Testing
```bash
# Use Lighthouse for performance auditing
npm install -g lighthouse
lighthouse https://your-app-url.com
```

### 3. Security Testing
- Test authentication flows
- Verify role-based access
- Check input validation
- Test Firebase security rules

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Check Firebase configuration
   - Verify API keys
   - Check network connectivity

2. **Authentication Issues**
   - Verify Firebase Auth is enabled
   - Check email/password method is activated
   - Review security rules

3. **Deployment Failures**
   ```bash
   # Clear Firebase cache
   firebase use --clear
   firebase use your-project-id
   
   # Re-deploy
   firebase deploy
   ```

4. **Performance Issues**
   - Check Firestore indexes
   - Optimize query patterns
   - Review caching strategies

### Debug Mode
Enable debug logging:
```javascript
// In firebase-config.js
import { connectFirestoreEmulator } from 'firebase/firestore';

if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Maintenance

### Regular Tasks
- Monitor application logs
- Update dependencies
- Review security rules
- Backup Firestore data
- Check performance metrics

### Updates
```bash
# Update Firebase SDK
npm update firebase

# Update Firebase CLI
npm install -g firebase-tools@latest
```

## Support

For issues and questions:
1. Check the documentation
2. Review console logs
3. Check Firebase Console for errors
4. Create GitHub issues for bugs
5. Contact the development team

---

**Note**: Remember to update the Firebase configuration with your actual project details before deployment!
