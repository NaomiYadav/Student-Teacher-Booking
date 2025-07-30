// Firebase Configuration - Fixed Version
console.log('🔧 Initializing Firebase configuration...');

// Always use mock Firebase to avoid import/configuration errors
let useMockFirebase = true;
let app = null;
let auth = null;
let db = null;

// Mock Firebase implementation (embedded to avoid import issues)
class MockAuth {
    constructor() {
        this.currentUser = null;
        this.onAuthStateChangedCallbacks = [];
    }

    createUserWithEmailAndPassword(email, password) {
        return new Promise((resolve, reject) => {
            // Check if user already exists
            const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
            const existingUser = existingUsers.find(u => u.email === email);
            
            if (existingUser) {
                reject(new Error('auth/email-already-in-use'));
                return;
            }
            
            const mockUser = {
                uid: 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                email: email,
                emailVerified: true
            };
            
            // Store user with password in mockUsers for authentication
            const newUser = {
                uid: mockUser.uid,
                email: email,
                password: password
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
            
            this.currentUser = mockUser;
            this.notifyAuthStateChanged(mockUser);
            resolve({ user: mockUser });
        });
    }

    signInWithEmailAndPassword(email, password) {
        return new Promise((resolve, reject) => {
            // Check mock users in localStorage
            const usersData = localStorage.getItem('mockUsers') || '[]';
            let users;
            
            try {
                users = JSON.parse(usersData);
                if (!Array.isArray(users)) {
                    console.warn('mockUsers is not an array, resetting to empty array');
                    users = [];
                    localStorage.setItem('mockUsers', JSON.stringify(users));
                }
            } catch (error) {
                console.warn('Error parsing mockUsers, resetting to empty array');
                users = [];
                localStorage.setItem('mockUsers', JSON.stringify(users));
            }
            
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                const mockUser = {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: true
                };
                this.currentUser = mockUser;
                this.notifyAuthStateChanged(mockUser);
                resolve({ user: mockUser });
            } else {
                reject(new Error('auth/user-not-found'));
            }
        });
    }

    signOut() {
        return new Promise((resolve) => {
            this.currentUser = null;
            this.notifyAuthStateChanged(null);
            resolve();
        });
    }

    onAuthStateChanged(callback) {
        this.onAuthStateChangedCallbacks.push(callback);
        // Call immediately with current state
        callback(this.currentUser);
        return () => {
            const index = this.onAuthStateChangedCallbacks.indexOf(callback);
            if (index > -1) this.onAuthStateChangedCallbacks.splice(index, 1);
        };
    }

    notifyAuthStateChanged(user) {
        this.onAuthStateChangedCallbacks.forEach(callback => callback(user));
    }
}

class MockFirestore {
    constructor() {
        this.collections = {};
    }

    collection(name) {
        return {
            doc: (id) => ({
                set: (data) => this.setDoc(name, id, data),
                get: () => this.getDoc(name, id),
                update: (data) => this.updateDoc(name, id, data),
                delete: () => this.deleteDoc(name, id)
            }),
            add: (data) => this.addDoc(name, data),
            get: () => this.getDocs(name)
        };
    }

    doc(collectionName, docId) {
        return {
            set: (data) => this.setDoc(collectionName, docId, data),
            get: () => this.getDoc(collectionName, docId),
            update: (data) => this.updateDoc(collectionName, docId, data),
            delete: () => this.deleteDoc(collectionName, docId)
        };
    }

    setDoc(collectionName, docId, data) {
        return new Promise((resolve) => {
            const storageKey = `mock_${collectionName}`;
            const collection = JSON.parse(localStorage.getItem(storageKey) || '{}');
            collection[docId] = { ...data, id: docId };
            localStorage.setItem(storageKey, JSON.stringify(collection));
            resolve();
        });
    }

    getDoc(collectionName, docId) {
        return new Promise((resolve) => {
            const storageKey = `mock_${collectionName}`;
            const collection = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const doc = collection[docId];
            resolve({
                exists: () => !!doc,
                data: () => doc,
                id: docId
            });
        });
    }

    getDocs(collectionName) {
        return new Promise((resolve) => {
            const storageKey = `mock_${collectionName}`;
            const collection = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const docs = Object.values(collection).map(doc => ({
                data: () => doc,
                id: doc.id
            }));
            resolve({ docs });
        });
    }

    updateDoc(collectionName, docId, data) {
        return new Promise((resolve) => {
            const storageKey = `mock_${collectionName}`;
            const collection = JSON.parse(localStorage.getItem(storageKey) || '{}');
            if (collection[docId]) {
                collection[docId] = { ...collection[docId], ...data };
                localStorage.setItem(storageKey, JSON.stringify(collection));
            }
            resolve();
        });
    }

    deleteDoc(collectionName, docId) {
        return new Promise((resolve) => {
            const storageKey = `mock_${collectionName}`;
            const collection = JSON.parse(localStorage.getItem(storageKey) || '{}');
            delete collection[docId];
            localStorage.setItem(storageKey, JSON.stringify(collection));
            resolve();
        });
    }

    addDoc(collectionName, data) {
        return new Promise((resolve) => {
            const docId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
            const storageKey = `mock_${collectionName}`;
            const collection = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const newDoc = { ...data, id: docId };
            collection[docId] = newDoc;
            localStorage.setItem(storageKey, JSON.stringify(collection));
            resolve({ id: docId, data: () => newDoc });
        });
    }
}

// Initialize mock Firebase
auth = new MockAuth();
db = new MockFirestore();
app = { name: 'mock-app' };

console.log('✅ Mock Firebase initialized successfully');
console.log('🎯 All Firebase operations will use local storage');

// Make services globally available
window.auth = auth;
window.db = db;
window.app = app;
window.useMockFirebase = useMockFirebase;

// Function to add sample teachers for testing
window.addSampleTeachers = async function() {
    const sampleTeachers = [
        {
            uid: 'teacher-1',
            email: 'john.smith@school.edu',
            name: 'Dr. John Smith',
            role: 'teacher',
            status: 'approved',
            department: 'Computer Science',
            subject: 'Data Structures and Algorithms',
            officeHours: 'Mon, Wed 2-4 PM'
        },
        {
            uid: 'teacher-2', 
            email: 'mary.johnson@school.edu',
            name: 'Prof. Mary Johnson',
            role: 'teacher',
            status: 'approved',
            department: 'Mathematics',
            subject: 'Calculus and Linear Algebra',
            officeHours: 'Tue, Thu 10-12 PM'
        },
        {
            uid: 'teacher-3',
            email: 'david.wilson@school.edu', 
            name: 'Dr. David Wilson',
            role: 'teacher',
            status: 'approved',
            department: 'Physics',
            subject: 'Quantum Mechanics',
            officeHours: 'Mon, Fri 1-3 PM'
        }
    ];

    for (const teacher of sampleTeachers) {
        await db.doc('users', teacher.uid).set(teacher);
    }
    
    console.log('✅ Sample teachers added successfully');
};

// Add sample teachers automatically on first load
setTimeout(() => {
    if (!localStorage.getItem('sampleTeachersAdded')) {
        addSampleTeachers();
        localStorage.setItem('sampleTeachersAdded', 'true');
    }
}, 1000);

// Function to create admin account
window.createAdminAccount = async function() {
    try {
        console.log('🚀 Starting admin account creation...');
        
        // Create multiple admin accounts for convenience
        const adminAccounts = [
            {
                uid: 'admin-001',
                email: 'admin@school.edu',
                name: 'System Administrator',
                role: 'admin',
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                uid: 'admin-002',
                email: 'admin@university.edu',
                name: 'University Administrator',
                role: 'admin', 
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                uid: 'admin-003',
                email: 'admin@demo.com',
                name: 'Demo Administrator',
                role: 'admin',
                status: 'approved', 
                createdAt: new Date().toISOString()
            }
        ];

        // Save all admin accounts to users collection (database)
        for (const adminData of adminAccounts) {
            console.log(`💾 Saving admin to database: ${adminData.email}`);
            await db.doc('users', adminData.uid).set(adminData);
            console.log(`✅ Admin saved: ${adminData.email}`);
        }
        
        // Also save admin credentials for login (localStorage)
        const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        console.log('📋 Existing users before adding admins:', existingUsers.length);
        
        // Add admin login credentials
        const adminCredentials = [
            { uid: 'admin-001', email: 'admin@school.edu', password: 'admin123' },
            { uid: 'admin-002', email: 'admin@university.edu', password: 'admin123' },
            { uid: 'admin-003', email: 'admin@demo.com', password: 'admin123' }
        ];
        
        for (const cred of adminCredentials) {
            const adminExists = existingUsers.find(u => u.email === cred.email);
            if (!adminExists) {
                existingUsers.push(cred);
                console.log(`🔐 Added login credential: ${cred.email}`);
            } else {
                console.log(`🔄 Login credential already exists: ${cred.email}`);
            }
        }
        
        localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
        console.log('💾 Saved all credentials to localStorage');
        
        // Verify the data was saved
        console.log('🔍 Verifying admin accounts in database...');
        for (const admin of adminAccounts) {
            const doc = await db.doc('users', admin.uid).get();
            if (doc.exists()) {
                console.log(`✅ Verified in database: ${admin.email}`);
            } else {
                console.error(`❌ Missing from database: ${admin.email}`);
            }
        }
        
        console.log('✅ Admin accounts created successfully');
        console.log('📧 Available Admin Emails:');
        console.log('   - admin@school.edu');
        console.log('   - admin@university.edu'); 
        console.log('   - admin@demo.com');
        console.log('🔑 Password for all: admin123');
        
        return true;
    } catch (error) {
        console.error('❌ Error creating admin account:', error);
        return false;
    }
};

// Force create admin accounts every time (for debugging)
setTimeout(() => {
    console.log('🔄 Creating admin accounts...');
    if (typeof window.createAdminAccount === 'function') {
        createAdminAccount();
    } else {
        console.error('❌ createAdminAccount function not found!');
    }
}, 1500);

// Also create accounts immediately without timeout
console.log('🚀 Creating admin accounts immediately...');
// Define the function inline first to ensure it exists
window.createAdminAccountNow = async function() {
    try {
        console.log('🚀 Creating admin account now...');
        
        // Simple admin account
        const adminData = {
            uid: 'admin-simple',
            email: 'admin@university.edu',
            name: 'University Administrator',
            role: 'admin',
            status: 'approved',
            createdAt: new Date().toISOString()
        };

        // Save to database
        await db.doc('users', adminData.uid).set(adminData);
        console.log('✅ Admin saved to database');
        
        // Save login credentials
        const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const adminCred = { uid: 'admin-simple', email: 'admin@university.edu', password: 'admin123' };
        
        // Remove existing admin if present
        const filteredUsers = users.filter(u => u.email !== 'admin@university.edu');
        filteredUsers.push(adminCred);
        
        localStorage.setItem('mockUsers', JSON.stringify(filteredUsers));
        console.log('✅ Admin credentials saved');
        
        // Verify
        const savedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const foundAdmin = savedUsers.find(u => u.email === 'admin@university.edu');
        console.log('🔍 Verification - Admin found:', !!foundAdmin);
        
        return true;
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        return false;
    }
};

// Create admin immediately
createAdminAccountNow();

// Debug function to show all accounts
window.showAllAccounts = function() {
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    console.log('📋 All Available Login Accounts:');
    users.forEach(user => {
        console.log(`📧 ${user.email} | 🔑 ${user.password} | 🆔 ${user.uid}`);
    });
    
    if (users.length === 0) {
        console.log('❌ No accounts found! Try running createAdminAccount()');
    }
    
    return users;
};

// Function to show all users in database
window.showAllUsersInDB = async function() {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map(doc => doc.data());
        console.log('📊 All Users in Database:');
        users.forEach(user => {
            console.log(`👤 ${user.name} | 📧 ${user.email} | 🎭 ${user.role} | 📋 ${user.status}`);
        });
        return users;
    } catch (error) {
        console.error('❌ Error fetching users from database:', error);
        return [];
    }
};

// Function to reset and recreate admin accounts
window.resetAdminAccounts = async function() {
    console.log('🔄 Resetting admin accounts...');
    
    // Clear existing admin accounts from localStorage
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const nonAdminUsers = users.filter(u => !u.email.includes('admin'));
    localStorage.setItem('mockUsers', JSON.stringify(nonAdminUsers));
    
    // Recreate admin accounts
    await createAdminAccount();
    
    console.log('✅ Admin accounts reset complete');
    showAllAccounts();
    await showAllUsersInDB();
};

// Show accounts on load for debugging
setTimeout(() => {
    console.log('🔍 Showing all available accounts:');
    showAllAccounts();
}, 2000);

// Add a simple test function to verify the file is loading
window.testFunction = function() {
    console.log('✅ firebase-config.js is loaded and working!');
    return 'Working!';
};

// Simple function to check accounts (available immediately)
window.checkAccounts = function() {
    const users = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    console.log('📋 Current Accounts:');
    if (users.length === 0) {
        console.log('❌ No accounts found');
    } else {
        users.forEach((user, index) => {
            console.log(`${index + 1}. 📧 ${user.email} | 🔑 ${user.password}`);
        });
    }
    return users;
};

// Immediately log that the file is being processed
console.log('🔄 firebase-config.js file is being processed...');
console.log('🧪 Test function created:', typeof window.testFunction);
console.log('🔍 Check accounts function created:', typeof window.checkAccounts);
