import { useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const SWIPE_THRESHOLD = 100; // Minimum distance to trigger swipe
const ROTATION_RANGE = 20; // Maximum rotation in degrees

const MovieCard = ({ movie, onSwipeLeft, onSwipeRight, index = 0 }) => {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-ROTATION_RANGE, ROTATION_RANGE]);
  const opacity = useTransform(x, [-500, -200, 0, 200, 500], [0, 0.5, 1, 0.5, 0]);
  const likeOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const rejectOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Determine if card should be swiped away
    if (Math.abs(offset) > SWIPE_THRESHOLD || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 1 : -1;
      const exitX = direction * 1000;

      animate(x, exitX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }).then(() => {
        if (direction > 0) {
          onSwipeRight?.(movie);
        } else {
          onSwipeLeft?.(movie);
        }
      });
    } else {
      // Snap back to center
      animate(x, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
      style={{
        x,
        rotate,
        opacity,
        zIndex: 10 - index,
        top: `${index * 10}px`,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      initial={{ scale: 1 - index * 0.05, y: index * 10 }}
      whileDrag={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Movie Poster */}
        <div className="relative h-96 bg-gray-200">
          {movie.poster ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
              <span className="text-gray-500 text-lg">No Poster</span>
            </div>
          )}
          
          {/* Swipe Indicator Overlays */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.3)',
              opacity: likeOpacity,
            }}
          >
            <div className="text-green-500 text-6xl font-bold">LIKE</div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.3)',
              opacity: rejectOpacity,
            }}
          >
            <div className="text-red-500 text-6xl font-bold">NOPE</div>
          </motion.div>
        </div>

        {/* Movie Info */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {movie.title}
          </h2>
          {movie.year && (
            <p className="text-gray-500 text-sm mb-4">{movie.year}</p>
          )}
          <p className="text-gray-600 leading-relaxed line-clamp-3">
            {movie.description || 'No description available.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieCard;
