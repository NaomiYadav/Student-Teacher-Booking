# 🔧 Registration Error Troubleshooting Guide

## Quick Diagnosis

Based on your screenshot showing the registration form with Student ID "naomi123" and 3rd Year selected, here are the most likely causes and solutions:

## 🚨 Most Common Issues

### 1. **Firebase Not Configured (90% of cases)**
**Problem**: Using placeholder values in `firebase-config.js`
**Solution**: 
1. Open `js/firebase-config.js`
2. Replace ALL placeholder values with your actual Firebase project credentials
3. Get credentials from [Firebase Console](https://console.firebase.google.com)

**Check**: Look for these placeholder values in your config:
```javascript
apiKey: "your-api-key-here"  // ❌ Replace this
authDomain: "your-project-id.firebaseapp.com"  // ❌ Replace this
```

### 2. **CORS/Local File Issues (5% of cases)**
**Problem**: Opening `index.html` directly in browser (file:// URL)
**Solution**: Use a local server
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve .

# Option 3: VS Code Live Server extension
```

### 3. **Firebase Services Not Enabled (3% of cases)**
**Problem**: Authentication or Firestore not enabled in Firebase Console
**Solution**:
1. Go to Firebase Console → Authentication → Sign-in method
2. Enable "Email/Password" provider
3. Go to Firestore Database → Create database → Start in test mode

### 4. **Form Validation Issues (2% of cases)**
**Problem**: Required fields not properly filled
**Solution**: Check console for validation error messages

## 🔍 Debugging Steps

### Step 1: Quick Test
1. Open `debug.html` in your browser
2. Click "Test Without Firebase" - should show ✅ validation passed
3. Click "Test Registration" - will show specific Firebase errors

### Step 2: Check Firebase Configuration
1. Open `firebase-checker.html` in your browser
2. Click "Check Firebase Configuration"
3. Follow the red error messages

### Step 3: Browser Console
1. Press F12 in your browser
2. Go to Console tab
3. Try registering again
4. Look for error messages (usually start with ❌)

## 📋 Error Messages & Solutions

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `Firebase configuration error` | Wrong config values | Update firebase-config.js |
| `Network error` | CORS/local file issue | Use local server |
| `Auth/invalid-api-key` | Wrong API key | Check Firebase project settings |
| `Permission denied` | Firestore rules too strict | Update security rules |
| `Email already in use` | Account exists | Try logging in instead |

## ⚡ Quick Fix Checklist

- [ ] Check if `firebase-config.js` has real values (not placeholders)
- [ ] Verify Firebase Authentication is enabled
- [ ] Verify Firestore Database is created
- [ ] Use local server (not file:// URL)
- [ ] Check browser console for error messages
- [ ] Try with different email address
- [ ] Verify all required fields are filled

## 🔧 Immediate Actions

1. **First**: Open `firebase-checker.html` and run all checks
2. **If config is wrong**: Follow the setup guide in `SETUP.md`
3. **If config is right**: Open browser console and try registering again
4. **Still issues**: Use `debug.html` for detailed error logging

## 📞 Get Help

If you're still having issues:
1. Open browser console (F12)
2. Take a screenshot of any error messages
3. Note which step fails in the checkers above
4. Check if you can access Firebase Console with your account

---

**Most likely fix**: Update `js/firebase-config.js` with your actual Firebase project credentials from the Firebase Console.
