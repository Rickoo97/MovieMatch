// TMDB API Configuration
// TODO: Replace with your TMDB API key
// Get your API key from: https://www.themoviedb.org/settings/api
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your-tmdb-api-key';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Streaming provider IDs for Netherlands
const STREAMING_PROVIDERS = {
  NETFLIX: 8,
  DISNEY_PLUS: 337,
  AMAZON_PRIME: 9,
};

/**
 * Fetch movies currently playing in cinemas in the Netherlands
 * @returns {Promise<Array>} Array of movie objects
 */
export const fetchCinemaMovies = async () => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&region=NL&language=en-US&page=1`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform TMDB data to our movie format
    return data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      description: movie.overview || 'No description available.',
      poster: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.error('Error fetching cinema movies:', error);
    throw error;
  }
};

/**
 * Fetch popular movies available on streaming platforms in the Netherlands
 * Fetches movies from Netflix (8), Disney+ (337), and Amazon Prime (9)
 * @returns {Promise<Array>} Array of movie objects
 */
export const fetchHomeMovies = async () => {
  try {
    // Combine provider IDs for Netflix, Disney+, and Amazon Prime
    const providerIds = [
      STREAMING_PROVIDERS.NETFLIX,
      STREAMING_PROVIDERS.DISNEY_PLUS,
      STREAMING_PROVIDERS.AMAZON_PRIME,
    ].join('|');

    // Fetch popular movies with watch providers filter
    // Using discover endpoint with watch_region, with_watch_providers, and watch_monetization_types filters
    const discoverUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&watch_region=NL&with_watch_providers=${providerIds}&watch_monetization_types=flatrate&sort_by=popularity.desc&language=en-US&page=1&vote_count.gte=100`;

    const response = await fetch(discoverUrl);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform TMDB data to our movie format
    return data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      description: movie.overview || 'No description available.',
      poster: movie.poster_path
        ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
        : null,
      rating: movie.vote_average,
      releaseDate: movie.release_date,
    }));
  } catch (error) {
    console.error('Error fetching home movies:', error);
    throw error;
  }
};

/**
 * Fetch movies based on the selected mode
 * @param {string} mode - 'Cinema' or 'Home'
 * @returns {Promise<Array>} Array of movie objects
 */
export const fetchMoviesByMode = async (mode) => {
  if (mode === 'Cinema') {
    return await fetchCinemaMovies();
  } else if (mode === 'Home') {
    return await fetchHomeMovies();
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }
};
