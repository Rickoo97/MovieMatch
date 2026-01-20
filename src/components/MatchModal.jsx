import Confetti from 'react-confetti';
import { useEffect, useState } from 'react';

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

const MatchModal = ({ show, movie, onClose }) => {
  const { width, height } = useWindowSize();

  if (!show || !movie) return null;

  return (
    <>
      <Confetti width={width} height={height} numberOfPieces={350} recycle={false} />

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 py-4 px-6 text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              It&apos;s a Match!
            </h2>
          </div>

          <div className="p-6 text-center">
            {movie.poster && (
              <div className="mb-4 flex justify-center">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-40 h-60 object-cover rounded-2xl shadow-lg border border-gray-100"
                />
              </div>
            )}

            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {movie.title || 'Unknown Movie'}
            </h3>
            {movie.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {movie.description}
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition-colors"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchModal;

