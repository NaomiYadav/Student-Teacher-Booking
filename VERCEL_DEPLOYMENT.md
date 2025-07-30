# 🚀 Vercel Deployment Guide

This guide will help you deploy the Student-Teacher Booking System to Vercel.

## 📋 Prerequisites

1. **Node.js** installed on your computer
2. **Git** installed and configured
3. **Vercel account** (free at https://vercel.com)
4. **GitHub account** (recommended for automatic deployments)

## 🔧 Step-by-Step Deployment

### Method 1: Deploy via Vercel CLI (Recommended)

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy from Project Directory
```bash
cd "c:\Users\acer\Downloads\unified mentor\Student-Teacher-Booking-"
vercel
```

#### 4. Follow the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `student-teacher-booking` (or your preferred name)
- **Directory?** → `./` (current directory)
- **Want to override settings?** → `N`

#### 5. Deploy to Production
```bash
vercel --prod
```

### Method 2: Deploy via GitHub (Automatic Deployments)

#### 1. Push to GitHub Repository
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2. Connect to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** Leave empty
   - **Output Directory:** `./`
   - **Install Command:** `npm install`

#### 3. Deploy
Click "Deploy" and wait for the build to complete.

### Method 3: Deploy via Vercel Dashboard (Drag & Drop)

#### 1. Create a ZIP file
- Select all project files (excluding `.git`, `node_modules`)
- Create a ZIP archive

#### 2. Upload to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Select "Browse" and upload your ZIP file
4. Configure project settings
5. Click "Deploy"

## 🔗 Environment Configuration

Since the application uses localStorage for data persistence, no additional environment variables are needed.

## 🎯 Post-Deployment

### 1. Test Your Application
After deployment, Vercel will provide a URL like:
```
https://student-teacher-booking-xyz.vercel.app
```

### 2. Test Core Features
- ✅ User registration (Student/Teacher)
- ✅ User login
- ✅ Student dashboard (Search Teachers, Book Appointments, View Appointments)
- ✅ Teacher dashboard (Set Availability, View Appointments, Edit Profile)
- ✅ Admin dashboard (if needed)

### 3. Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS settings as instructed

## 🔧 Configuration Files

The following files have been configured for Vercel deployment:

### `vercel.json`
```json
{
  "version": 2,
  "name": "student-teacher-booking-system",
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### `package.json` (Updated)
Added Vercel deployment scripts:
```json
{
  "deploy:vercel": "vercel --prod",
  "deploy:vercel:preview": "vercel"
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. **Build Errors**
- Ensure all files are included
- Check that `index.html` is in the root directory

#### 2. **404 Errors**
- Verify file paths are correct
- Check that all CSS/JS files are properly linked

#### 3. **JavaScript Errors**
- Open browser developer tools
- Check console for any errors
- Verify all script files are loading

#### 4. **CORS Issues**
- The application uses local storage, so no CORS issues should occur
- If issues persist, check browser security settings

### Getting Help

1. **Vercel Documentation:** https://vercel.com/docs
2. **Vercel Support:** https://vercel.com/support
3. **Project Issues:** Check browser console for JavaScript errors

## 🎉 Success!

Once deployed, your Student-Teacher Booking System will be available worldwide with:
- ⚡ Fast global CDN
- 🔒 HTTPS by default
- 📱 Mobile-responsive design
- 🔄 Automatic deployments (if using GitHub)

## 📊 Features Available After Deployment

### For Students:
- Register and login
- Search and browse teachers by department/subject
- Book appointments with preferred teachers
- View and manage their appointments
- Cancel pending appointments

### For Teachers:
- Register and login (requires admin approval)
- Set availability schedules
- View incoming appointment requests
- Approve or reject appointments
- Edit profile information

### For Admins:
- Approve teacher registrations
- Manage user accounts
- Monitor system activity

---

**Ready to deploy? Choose your preferred method above and get your application live in minutes!**
