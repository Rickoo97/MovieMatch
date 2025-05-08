// api/get-movies.js (voor Vercel Functions)

export default async function handler(req, res) {
    const { genres } = req.query;
  
    if (!genres) {
      return res.status(400).json({ error: 'Genres ontbreken' });
    }
  
    const apiKey = process.env.TMDB_API_KEY;
  
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=nl-NL&with_genres=${genres}`
      );
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Fout bij ophalen van films' });
    }
  }
  