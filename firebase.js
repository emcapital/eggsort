// Eggsorter – Firebase setup and auth helpers (ES module, loaded from the Firebase CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, onValue, set, push, remove } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyB6K5BL2nThZsz6UpS9ai5KHXRvI9oQa4c",
    authDomain: "eggsorter-3d128.firebaseapp.com",
    projectId: "eggsorter-3d128",
    storageBucket: "eggsorter-3d128.firebasestorage.app",
    messagingSenderId: "102128420175",
    appId: "1:102128420175:web:b0584d1066cb42d65a713a",
    measurementId: "G-52NDXLBRWH",
    // Copy the exact URL from Firebase console > Realtime Database (it differs if you picked another region,
    // e.g. https://eggsorter-3d128-default-rtdb.asia-southeast1.firebasedatabase.app)
    databaseURL: "https://eggsorter-3d128-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
isSupported().then((ok) => ok && getAnalytics(app)).catch(() => { });

const auth = getAuth(app);
const google = new GoogleAuthProvider();
google.setCustomParameters({ prompt: "select_account" });

export const signInEmail = async (email, password) =>
    (await signInWithEmailAndPassword(auth, email, password)).user;

export const signUpEmail = async (email, password) =>
    (await createUserWithEmailAndPassword(auth, email, password)).user;

export const signInGoogle = async () => (await signInWithPopup(auth, google)).user;

export const logOut = () => signOut(auth);

export const watchAuth = (callback) => onAuthStateChanged(auth, callback);

const db = getDatabase(app);

// Live-listen to a Realtime Database path. Returns an unsubscribe function.
export const watchPath = (path, onData, onError) =>
    onValue(ref(db, path), (snap) => onData(snap.val()), onError);

// ---- Profile (stored in Realtime Database at profiles/<uid>) ----
export const saveProfile = async (name) => {
    const u = auth.currentUser;
    if (!u) throw new Error("Not signed in");
    await set(ref(db, `profiles/${u.uid}`), { name, email: u.email || "", updatedAt: Date.now() });
    await updateProfile(u, { displayName: name }); // keeps the Firebase Auth name in sync too
};

// Emails a password-reset link (passwords are never stored in the database).
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

// ---- Generic helpers used by the Accounting page ----
export const setPath = (path, value) => set(ref(db, path), value);
export const addItem = (path, value) => push(ref(db, path), value); // adds a new child with a unique key
export const removePath = (path) => remove(ref(db, path));

export { auth, db };