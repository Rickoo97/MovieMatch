import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayUnion,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth } from '../config/firebase';
import { db } from '../config/firebase';

/**
 * Generates a random session ID
 * @returns {string} Random session ID
 */
const generateSessionId = () => {
  return `session-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Gets the current authenticated user ID
 * @returns {string} User ID
 * @throws {Error} If user is not authenticated
 */
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }
  return user.uid;
};

/**
 * Creates a new session document with a friend.
 * Generates a random session ID, creates the document with mode, and adds
 * both the current user and the friend to the users array.
 *
 * @param {string} mode - "cinema" or "home"
 * @param {string} friendUid - UID of the friend to include in the session
 * @returns {Promise<string>} The generated session ID
 */
export const createSession = async (mode, friendUid) => {
  try {
    if (!mode || (mode !== 'cinema' && mode !== 'home')) {
      throw new Error('Mode must be "cinema" or "home"');
    }

    if (!friendUid) {
      throw new Error('Friend UID is required to start a session.');
    }

    const userId = getCurrentUserId();
    const sessionId = generateSessionId();
    const sessionRef = doc(db, 'sessions', sessionId);

    await setDoc(sessionRef, {
      users: [userId, friendUid],
      matches: [],
      mode,
      createdAt: new Date().toISOString(),
    });

    return sessionId;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

/**
 * Adds the current user to an existing session's users array
 * @param {string} sessionId - The session ID to join
 * @returns {Promise<void>}
 */
export const joinSession = async (sessionId) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    const userId = getCurrentUserId();
    const sessionRef = doc(db, 'sessions', sessionId);

    // Check if session exists
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error('Session does not exist');
    }

    // Check if user is already in the session
    const sessionData = sessionDoc.data();
    if (sessionData.users && sessionData.users.includes(userId)) {
      console.log('User is already in this session');
      return;
    }

    // Add user to users array
    await updateDoc(sessionRef, {
      users: arrayUnion(userId),
    });
  } catch (error) {
    console.error('Error joining session:', error);
    throw error;
  }
};

/**
 * Sets up a real-time listener for a session document
 * Calls the callback function whenever the session data changes
 * @param {string} sessionId - The session ID to listen to
 * @param {Function} callback - Callback function that receives the session data
 * @returns {Function} Unsubscribe function to stop listening
 */
export const listenToSession = (sessionId, callback) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    const sessionRef = doc(db, 'sessions', sessionId);

    const unsubscribe = onSnapshot(
      sessionRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          callback({
            id: docSnapshot.id,
            ...data,
          });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to session:', error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up session listener:', error);
    throw error;
  }
};

/**
 * Handles a swipe right action on a movie
 * Updates the likes array in the swipes subcollection document
 * If 2 or more users like the movie, adds it to the matches array in the session document
 * @param {string} sessionId - The session ID
 * @param {string|number} movieId - The movie ID
 * @param {string} userId - The user ID who swiped right
 * @returns {Promise<void>}
 */
export const handleSwipeRight = async (sessionId, movieId, userId) => {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    if (!movieId) {
      throw new Error('Movie ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Reference to the swipe document in the subcollection
    const swipeRef = doc(db, 'sessions', sessionId, 'swipes', String(movieId));

    // Update the likes array using setDoc with merge
    await setDoc(
      swipeRef,
      {
        likes: arrayUnion(userId),
      },
      { merge: true }
    );

    // Get the updated document to check likes array length
    const swipeDoc = await getDoc(swipeRef);
    const swipeData = swipeDoc.data();

    // CRITICAL MATCH LOGIC: Check if likes array has 2 or more users
    if (swipeData && swipeData.likes && swipeData.likes.length >= 2) {
      // Update the parent session document to add movieId to matches array
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        matches: arrayUnion(Number(movieId)),
      });

      console.log(`Match found! Movie ${movieId} has been added to matches.`);
    }
  } catch (error) {
    console.error('Error handling swipe right:', error);
    throw error;
  }
};

/**
 * Adds a friend by their email address.
 * - Validates that the user exists
 * - Prevents adding yourself
 * - Prevents adding an existing friend
 * - Adds both users to each other's friends array (mutual friendship)
 *
 * @param {string} currentUserUid - UID of the current authenticated user
 * @param {string} email - Email of the user to add as a friend
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const addFriendByEmail = async (currentUserUid, email) => {
  try {
    if (!currentUserUid) {
      throw new Error('You must be logged in to add friends.');
    }

    if (!email) {
      throw new Error('Please enter an email address.');
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', trimmedEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('No user found with that email.');
    }

    // Assuming emails are unique, take the first match
    const friendDoc = querySnapshot.docs[0];
    const friendData = friendDoc.data();
    const friendUid = friendData.uid || friendDoc.id;

    // Cannot add yourself
    if (friendUid === currentUserUid) {
      throw new Error('You cannot add yourself as a friend.');
    }

    // Get current user document to check existing friends
    const currentUserRef = doc(db, 'users', currentUserUid);
    const currentUserSnap = await getDoc(currentUserRef);

    if (!currentUserSnap.exists()) {
      throw new Error('Current user profile not found.');
    }

    const currentUserData = currentUserSnap.data();
    const currentFriends = currentUserData.friends || [];

    // Optional: check if already friends
    if (currentFriends.includes(friendUid)) {
      throw new Error('You are already friends with this user.');
    }

    // Friend document reference (may or may not match UID as ID)
    const friendRef = doc(db, 'users', friendUid);

    // Make friendship mutual
    await Promise.all([
      updateDoc(currentUserRef, {
        friends: arrayUnion(friendUid),
      }),
      updateDoc(friendRef, {
        friends: arrayUnion(currentUserUid),
      }),
    ]);

    return { success: true, message: 'Friend added!' };
  } catch (error) {
    console.error('Error adding friend by email:', error);
    throw error;
  }
};

/**
 * Fetches full user documents for an array of friend UIDs.
 * Uses a Firestore "in" query on the uid field.
 *
 * @param {string[]} friendUidsArray - Array of user UIDs
 * @returns {Promise<Array<Object>>} Array of user documents
 */
export const getFriendsDetails = async (friendUidsArray) => {
  try {
    if (!Array.isArray(friendUidsArray) || friendUidsArray.length === 0) {
      return [];
    }

    const usersRef = collection(db, 'users');
    const friends = [];

    // Firestore "in" queries are limited to 10 items per query
    const BATCH_SIZE = 10;
    for (let i = 0; i < friendUidsArray.length; i += BATCH_SIZE) {
      const batch = friendUidsArray.slice(i, i + BATCH_SIZE);
      const q = query(usersRef, where('uid', 'in', batch));
      const snapshot = await getDocs(q);

      snapshot.forEach((docSnap) => {
        friends.push({
          id: docSnap.id,
          ...docSnap.data(),
        });
      });
    }

    return friends;
  } catch (error) {
    console.error('Error fetching friends details:', error);
    throw error;
  }
};
