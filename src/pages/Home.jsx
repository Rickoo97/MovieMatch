import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FriendsManager from '../components/FriendsManager';

const Home = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = currentUser?.displayName || currentUser?.email || 'User';
  const photoURL = currentUser?.photoURL;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            {photoURL && (
              <img
                src={photoURL}
                alt={displayName}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-purple-200"
              />
            )}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome, {displayName}!
            </h1>
            <p className="text-gray-600">
              Ready to discover your next favorite movie?
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Signing out...' : 'Logout'}
          </button>
        </div>

        <div className="max-w-md mx-auto mt-6">
          <FriendsManager />
        </div>
      </div>
    </div>
  );
};

export default Home;
