import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MovieCardStack from '../components/MovieCardStack';
import { fetchCinemaMovies, fetchHomeMovies } from '../services/tmdbApi';
import {
  handleSwipeRight as recordSwipeRight,
  listenToSession,
} from '../services/firebaseService';
import MatchModal from '../components/MatchModal';

const SessionPage = () => {
  const { sessionId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState(null);

  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [moviesError, setMoviesError] = useState(null);

  const [previousMatchCount, setPreviousMatchCount] = useState(0);
  const [matchedMovie, setMatchedMovie] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const mode = session?.mode; // expected: 'cinema' | 'home'

  const sessionTitle = useMemo(() => {
    if (mode === 'cinema') return 'Cinema Session';
    if (mode === 'home') return 'Home Session';
    return 'Session';
  }, [mode]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">You must be logged in</h1>
          <p className="text-gray-600 text-sm">
            Please go back and sign in to access this session.
          </p>
        </div>
      </div>
    );
  }

  // Subscribe to the session document and watch for new matches
  useEffect(() => {
    if (!sessionId) {
      setSessionError('Missing session ID.');
      setLoadingSession(false);
      return;
    }

    setLoadingSession(true);
    setSessionError(null);

    let isFirstSnapshot = true;

    const unsubscribe = listenToSession(sessionId, (data, error) => {
      if (error) {
        console.error('Error loading session:', error);
        setSessionError(error?.message || 'Failed to load session.');
        setLoadingSession(false);
        return;
      }

      if (!data) {
        setSession(null);
        setSessionError('Session not found.');
        setLoadingSession(false);
        return;
      }

      // Optional access check: user must be part of the session users array
      if (Array.isArray(data.users) && !data.users.includes(currentUser.uid)) {
        setSession(null);
        setSessionError('You do not have access to this session.');
        setLoadingSession(false);
        return;
      }

      setSession(data);
      setLoadingSession(false);

      const matches = Array.isArray(data.matches) ? data.matches : [];
      const currentCount = matches.length;

      if (isFirstSnapshot) {
        // Initialize without triggering a match modal for existing matches
        setPreviousMatchCount(currentCount);
        isFirstSnapshot = false;
        return;
      }

      if (currentCount > previousMatchCount) {
        const lastMatchId = matches[matches.length - 1];
        const matched = movies.find((m) => Number(m.id) === Number(lastMatchId));

        if (matched) {
          setMatchedMovie(matched);
          setShowMatchModal(true);
        }

        setPreviousMatchCount(currentCount);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [sessionId, currentUser.uid, movies, previousMatchCount]);

  // Fetch movies based on session mode
  useEffect(() => {
    const loadMovies = async () => {
      if (!mode) return;

      try {
        setLoadingMovies(true);
        setMoviesError(null);

        const fetched =
          mode === 'cinema' ? await fetchCinemaMovies() : await fetchHomeMovies();

        setMovies(fetched);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setMoviesError(error?.message || 'Failed to load movies.');
      } finally {
        setLoadingMovies(false);
      }
    };

    loadMovies();
  }, [mode]);

  const handleCopyLink = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (error) {
      // Fallback for browsers that block clipboard API
      try {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('Link copied to clipboard!');
      } catch (fallbackError) {
        console.error('Failed to copy link:', error, fallbackError);
        alert('Failed to copy link. Please copy it from the address bar.');
      }
    }
  };

  const onSwipeLeft = () => {
    // No DB action for now
  };

  const onSwipeRight = async (movie) => {
    if (!sessionId || !currentUser?.uid || !movie?.id) return;

    try {
      await recordSwipeRight(sessionId, movie.id, currentUser.uid);
    } catch (error) {
      console.error('Error recording swipe right:', error);
      // Keep UX smooth: don't block swiping; just surface minimal feedback
      alert(error?.message || 'Failed to save your like. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{sessionTitle}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Session ID: <span className="font-mono break-all">{sessionId}</span>
                </p>
                {mode && (
                  <p className="text-sm text-gray-600 mt-1">
                    Mode: <span className="font-semibold">{mode}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                >
                  Copy Link to Share
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="px-3 py-2 text-sm rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-medium"
                >
                  Back Home
                </button>
              </div>
            </div>

            {(loadingSession || loadingMovies) && (
              <p className="text-gray-500 text-sm mt-4">Loading...</p>
            )}

            {sessionError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{sessionError}</p>
              </div>
            )}

            {!sessionError && moviesError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{moviesError}</p>
              </div>
            )}
          </div>

          {!sessionError && !loadingMovies && movies.length === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <p className="text-gray-600">No movies found for this mode.</p>
            </div>
          )}

          {!sessionError && movies.length > 0 && (
            <MovieCardStack
              movies={movies}
              onSwipeLeft={onSwipeLeft}
              onSwipeRight={onSwipeRight}
            />
          )}

          <MatchModal
            show={showMatchModal}
            movie={matchedMovie}
            onClose={() => setShowMatchModal(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionPage;

