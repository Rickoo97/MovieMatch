import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { addFriendByEmail, getFriendsDetails, createSession } from '../services/firebaseService';

const FriendsManager = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [loading, setLoading] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [sessionStartLoading, setSessionStartLoading] = useState(null); // friendUid|mode key

  // Listen to the current user's Firestore profile to get the friends array
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserProfile(null);
      setFriends([]);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setUserProfile({ id: docSnap.id, ...docSnap.data() });
        } else {
          setUserProfile(null);
          setFriends([]);
        }
      },
      (error) => {
        console.error('Error listening to user profile:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // When the friends array on the user profile changes, fetch full friend details
  useEffect(() => {
    const fetchFriends = async () => {
      if (!userProfile?.friends || userProfile.friends.length === 0) {
        setFriends([]);
        setFriendsLoading(false);
        return;
      }

      try {
        setFriendsLoading(true);
        const friendDetails = await getFriendsDetails(userProfile.friends);
        setFriends(friendDetails);
      } catch (error) {
        console.error('Error fetching friends details:', error);
      } finally {
        setFriendsLoading(false);
      }
    };

    fetchFriends();
  }, [userProfile?.friends]);

  const handleAddFriend = async (e) => {
    e.preventDefault();

    if (!currentUser?.uid) {
      setStatus({ type: 'error', message: 'You must be logged in to add friends.' });
      return;
    }

    if (!emailInput.trim()) {
      setStatus({ type: 'error', message: 'Please enter an email address.' });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      const result = await addFriendByEmail(currentUser.uid, emailInput.trim());

      setStatus({ type: 'success', message: result.message || 'Friend added!' });
      setEmailInput('');
    } catch (error) {
      setStatus({
        type: 'error',
        message: error?.message || 'Failed to add friend. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (friendUid, mode) => {
    if (!currentUser?.uid) {
      setStatus({ type: 'error', message: 'You must be logged in to start a session.' });
      return;
    }

    if (!friendUid) {
      setStatus({ type: 'error', message: 'Friend information is missing.' });
      return;
    }

    const normalizedMode = mode.toLowerCase();

    try {
      const loadingKey = `${friendUid}-${normalizedMode}`;
      setSessionStartLoading(loadingKey);
      setStatus(null);

      const sessionId = await createSession(normalizedMode, friendUid);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Error starting session:', error);
      setStatus({
        type: 'error',
        message: error?.message || 'Failed to start session. Please try again.',
      });
    } finally {
      setSessionStartLoading(null);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Friends</h2>

      <form onSubmit={handleAddFriend} className="mb-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Add friend by email
          </label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="friend@example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
        >
          {loading ? 'Adding friend...' : 'Add Friend'}
        </button>
      </form>

      {status && (
        <div
          className={`mb-4 text-sm px-3 py-2 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {status.message}
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Your friends</h3>
        {friendsLoading ? (
          <p className="text-gray-500 text-sm">Loading friends...</p>
        ) : friends.length === 0 ? (
          <p className="text-gray-500 text-sm">
            You have no friends added yet. Add someone using their email.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {friends.map((friend) => {
              const friendUid = friend.uid || friend.id;
              const cinemaKey = `${friendUid}-cinema`;
              const homeKey = `${friendUid}-home`;

              return (
                <li
                  key={friendUid}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {friend.displayName || friend.email || 'Unnamed user'}
                    </p>
                    {friend.email && (
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartSession(friendUid, 'cinema')}
                      disabled={sessionStartLoading === cinemaKey}
                      className="px-3 py-1 text-xs sm:text-sm rounded-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sessionStartLoading === cinemaKey ? 'Starting...' : '🍿 Cinema'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartSession(friendUid, 'home')}
                      disabled={sessionStartLoading === homeKey}
                      className="px-3 py-1 text-xs sm:text-sm rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sessionStartLoading === homeKey ? 'Starting...' : '🏠 Home'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendsManager;

