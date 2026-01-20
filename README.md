# MovieMatch

A Tinder-like swipeable movie discovery app built with React, Vite, Tailwind CSS, and Firebase. Swipe through movies from TMDB API and match with your favorites!

## Features

- 🎬 **Cinema Mode**: Discover movies currently playing in cinemas in the Netherlands
- 🏠 **Home Mode**: Browse popular movies available on Netflix, Disney+, and Amazon Prime in the Netherlands
- 👆 **Swipeable Cards**: Intuitive swipe gestures to like or reject movies
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS and Framer Motion

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure TMDB API Key

Create a `.env` file in the root directory:

```env
VITE_TMDB_API_KEY=your-tmdb-api-key-here
```

Get your TMDB API key from: https://www.themoviedb.org/settings/api

### 3. Configure Firebase (Optional)

Update `src/config/firebase.js` with your Firebase project credentials.

### 4. Run Development Server

```bash
npm run dev
```

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth swipe interactions
- **Firebase** - Backend services (Firestore & Auth)
- **TMDB API** - Movie data source

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── MovieCard.jsx        # Swipeable movie card
│   ├── MovieCardStack.jsx   # Stack manager for cards
│   └── ModeSelector.jsx     # Cinema/Home mode switcher
├── contexts/        # React contexts
│   └── ModeContext.jsx      # Mode state management
├── services/        # API services
│   └── tmdbApi.js           # TMDB API functions
├── config/          # Configuration files
│   └── firebase.js          # Firebase setup
├── pages/           # Page components
└── hooks/           # Custom React hooks
```

## API Endpoints Used

- **Cinema Mode**: `GET /movie/now_playing` (region: NL)
- **Home Mode**: `GET /discover/movie` (with streaming providers filter)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
