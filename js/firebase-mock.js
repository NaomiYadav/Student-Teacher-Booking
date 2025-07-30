// Local Storage Mock for Firebase (Development/Testing)
class MockAuth {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
        this.users = JSON.parse(localStorage.getItem('mockUsers') || '{}');
        
        // Check if user is already logged in
        const savedUser = localStorage.getItem('mockCurrentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            setTimeout(() => this.notifyListeners(), 100);
        }
    }
    
    async createUserWithEmailAndPassword(email, password) {
        console.log('🔄 Mock: Creating user with email/password');
        
        if (this.users[email]) {
            throw new Error('auth/email-already-in-use');
        }
        
        const user = {
            uid: 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            email: email,
            emailVerified: false
        };
        
        this.users[email] = { ...user, password };
        localStorage.setItem('mockUsers', JSON.stringify(this.users));
        
        this.currentUser = user;
        localStorage.setItem('mockCurrentUser', JSON.stringify(user));
        
        setTimeout(() => this.notifyListeners(), 100);
        
        return { user };
    }
    
    async signInWithEmailAndPassword(email, password) {
        console.log('🔄 Mock: Signing in with email/password');
        
        const userData = this.users[email];
        if (!userData) {
            throw new Error('auth/user-not-found');
        }
        
        if (userData.password !== password) {
            throw new Error('auth/wrong-password');
        }
        
        this.currentUser = {
            uid: userData.uid,
            email: userData.email,
            emailVerified: userData.emailVerified
        };
        
        localStorage.setItem('mockCurrentUser', JSON.stringify(this.currentUser));
        setTimeout(() => this.notifyListeners(), 100);
        
        return { user: this.currentUser };
    }
    
    async signOut() {
        console.log('🔄 Mock: Signing out');
        this.currentUser = null;
        localStorage.removeItem('mockCurrentUser');
        setTimeout(() => this.notifyListeners(), 100);
    }
    
    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        // Immediately call with current state
        setTimeout(() => callback(this.currentUser), 0);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.currentUser));
    }
}

class MockFirestore {
    constructor() {
        this.data = JSON.parse(localStorage.getItem('mockFirestore') || '{}');
    }
    
    collection(collectionPath) {
        return new MockCollection(collectionPath, this);
    }
    
    doc(path) {
        return new MockDocumentReference(path, this);
    }
    
    saveData() {
        localStorage.setItem('mockFirestore', JSON.stringify(this.data));
    }
}

class MockCollection {
    constructor(path, firestore) {
        this.path = path;
        this.firestore = firestore;
    }
    
    doc(id) {
        return new MockDocumentReference(`${this.path}/${id}`, this.firestore);
    }
    
    async add(data) {
        const id = 'mock-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const docRef = this.doc(id);
        await docRef.set(data);
        return docRef;
    }
    
    where(field, operator, value) {
        return new MockQuery(this.path, this.firestore, [{ field, operator, value }]);
    }
    
    async get() {
        const collectionData = this.firestore.data[this.path] || {};
        const docs = Object.keys(collectionData).map(id => new MockDocumentSnapshot(id, collectionData[id]));
        return { docs, empty: docs.length === 0 };
    }
}

class MockDocumentReference {
    constructor(path, firestore) {
        this.path = path;
        this.firestore = firestore;
        this.id = path.split('/').pop();
    }
    
    async set(data) {
        console.log('🔄 Mock: Setting document', this.path, data);
        const pathParts = this.path.split('/');
        const collection = pathParts[0];
        const id = pathParts[1];
        
        if (!this.firestore.data[collection]) {
            this.firestore.data[collection] = {};
        }
        
        this.firestore.data[collection][id] = { ...data, id };
        this.firestore.saveData();
    }
    
    async get() {
        const pathParts = this.path.split('/');
        const collection = pathParts[0];
        const id = pathParts[1];
        
        const data = this.firestore.data[collection]?.[id];
        return new MockDocumentSnapshot(id, data);
    }
    
    async update(data) {
        const pathParts = this.path.split('/');
        const collection = pathParts[0];
        const id = pathParts[1];
        
        if (!this.firestore.data[collection]?.[id]) {
            throw new Error('Document does not exist');
        }
        
        this.firestore.data[collection][id] = {
            ...this.firestore.data[collection][id],
            ...data
        };
        this.firestore.saveData();
    }
    
    async delete() {
        const pathParts = this.path.split('/');
        const collection = pathParts[0];
        const id = pathParts[1];
        
        if (this.firestore.data[collection]?.[id]) {
            delete this.firestore.data[collection][id];
            this.firestore.saveData();
        }
    }
}

class MockDocumentSnapshot {
    constructor(id, data) {
        this.id = id;
        this._data = data;
        this.exists = !!data;
    }
    
    data() {
        return this._data;
    }
}

class MockQuery {
    constructor(path, firestore, conditions = []) {
        this.path = path;
        this.firestore = firestore;
        this.conditions = conditions;
    }
    
    where(field, operator, value) {
        return new MockQuery(this.path, this.firestore, [...this.conditions, { field, operator, value }]);
    }
    
    async get() {
        const collectionData = this.firestore.data[this.path] || {};
        let docs = Object.keys(collectionData).map(id => new MockDocumentSnapshot(id, collectionData[id]));
        
        // Apply conditions
        docs = docs.filter(doc => {
            return this.conditions.every(condition => {
                const docData = doc.data();
                const fieldValue = docData[condition.field];
                
                switch (condition.operator) {
                    case '==':
                        return fieldValue === condition.value;
                    case '!=':
                        return fieldValue !== condition.value;
                    case '>':
                        return fieldValue > condition.value;
                    case '<':
                        return fieldValue < condition.value;
                    case '>=':
                        return fieldValue >= condition.value;
                    case '<=':
                        return fieldValue <= condition.value;
                    case 'array-contains':
                        return Array.isArray(fieldValue) && fieldValue.includes(condition.value);
                    default:
                        return true;
                }
            });
        });
        
        return { docs, empty: docs.length === 0 };
    }
}

// Export mock implementations
export const mockAuth = new MockAuth();
export const mockDb = new MockFirestore();

// Mock Firebase functions
export function doc(db, collection, id) {
    return db.collection(collection).doc(id);
}

export function setDoc(docRef, data) {
    return docRef.set(data);
}

export function getDoc(docRef) {
    return docRef.get();
}

export function collection(db, path) {
    return db.collection(path);
}

export function query(collectionRef, ...conditions) {
    let q = collectionRef;
    conditions.forEach(condition => {
        if (condition.type === 'where') {
            q = q.where(condition.field, condition.operator, condition.value);
        }
    });
    return q;
}

export function where(field, operator, value) {
    return { type: 'where', field, operator, value };
}

export function getDocs(queryRef) {
    return queryRef.get();
}

export function updateDoc(docRef, data) {
    return docRef.update(data);
}

export function deleteDoc(docRef) {
    return docRef.delete();
}

export function addDoc(collectionRef, data) {
    return collectionRef.add(data);
}

export async function createUserWithEmailAndPassword(auth, email, password) {
    return auth.createUserWithEmailAndPassword(email, password);
}

export async function signInWithEmailAndPassword(auth, email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

export async function signOut(auth) {
    return auth.signOut();
}

export function onAuthStateChanged(auth, callback) {
    return auth.onAuthStateChanged(callback);
}
