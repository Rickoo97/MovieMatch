// api/get-streams.js

export default async function handler(req, res) {
    const { id } = req.query;
    const apiKey = process.env.TMDB_API_KEY;
  
    if (!id) {
      return res.status(400).json({ error: 'Film ID ontbreekt' });
    }
  
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${apiKey}`);
      const data = await response.json();
      const providers = data.results?.NL?.flatrate || [];
      const platforms = providers.length > 0 ? providers.map(p => p.provider_name).join(', ') : 'Niet beschikbaar op streamingplatforms';
      res.status(200).json({ platforms });
    } catch (error) {
      res.status(500).json({ error: 'Fout bij ophalen van streamproviders' });
    }
  }