// api/get-trailer.js

export default async function handler(req, res) {
    const { id } = req.query;
    const apiKey = process.env.TMDB_API_KEY;
  
    if (!id) {
      return res.status(400).json({ error: 'Film ID ontbreekt' });
    }
  
    try {
      let url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=nl-NL`;
      let response = await fetch(url);
      let data = await response.json();
  
      let trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
  
      if (!trailer) {
        url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${apiKey}&language=en-US`;
        response = await fetch(url);
        data = await response.json();
        trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official);
      }
  
      if (trailer) {
        res.status(200).json({ url: `https://www.youtube.com/embed/${trailer.key}` });
      } else {
        res.status(200).json({ url: null });
      }
    } catch (error) {
      res.status(500).json({ error: 'Fout bij ophalen van trailer' });
    }
  }