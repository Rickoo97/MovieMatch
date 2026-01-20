import { useState } from 'react';
import MovieCard from './MovieCard';

const MovieCardStack = ({ movies = [], onSwipeLeft, onSwipeRight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipedMovies, setSwipedMovies] = useState([]);

  const handleSwipeLeft = (movie) => {
    setSwipedMovies([...swipedMovies, { ...movie, action: 'rejected' }]);
    setCurrentIndex(currentIndex + 1);
    onSwipeLeft?.(movie);
  };

  const handleSwipeRight = (movie) => {
    setSwipedMovies([...swipedMovies, { ...movie, action: 'liked' }]);
    setCurrentIndex(currentIndex + 1);
    onSwipeRight?.(movie);
  };

  // Show the top 3 cards in the stack
  const visibleMovies = movies
    .slice(currentIndex, currentIndex + 3)
    .map((movie, index) => ({
      ...movie,
      index,
    }));

  if (currentIndex >= movies.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">No more movies!</h2>
          <p className="text-gray-500">You've swiped through all the movies.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md h-[600px] mx-auto">
      {visibleMovies.map((movie) => (
        <MovieCard
          key={movie.id || `${movie.title}-${currentIndex + movie.index}`}
          movie={movie}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          index={movie.index}
        />
      ))}
    </div>
  );
};

export default MovieCardStack;
