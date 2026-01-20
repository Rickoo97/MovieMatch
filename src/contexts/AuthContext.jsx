import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Syncs user data to Firestore users collection
   * Creates new user document if doesn't exist, or updates lastLogin if exists
   */
  const syncUserToFirestore = async (user) => {
    try {
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // New user: Create document with all fields
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          friends: [],
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        });
        console.log('New user created in Firestore');
      } else {
        // Existing user: Update lastLogin timestamp only
        // DO NOT overwrite friends array
        await updateDoc(userRef, {
          lastLogin: serverTimestamp(),
          // Optionally update other fields if they changed
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
        });
        console.log('Existing user updated in Firestore');
      }
    } catch (error) {
      console.error('Error syncing user to Firestore:', error);
      throw error;
    }
  };

  /**
   * Sign in with Google
   */
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Sync user to Firestore after successful sign-in
      await syncUserToFirestore(user);
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  /**
   * Sign out
   */
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user to Firestore when auth state changes
        try {
          await syncUserToFirestore(user);
        } catch (error) {
          console.error('Error syncing user on auth state change:', error);
        }
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signInWithGoogle,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
