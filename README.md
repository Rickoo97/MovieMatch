# 🎬 MovieMatch

**MovieMatch** is een gebruiksvriendelijke webapplicatie waarmee je op basis van jouw favoriete genres filmsuggesties krijgt. De site gebruikt de TMDB API en Supabase om gebruikers te helpen bij het ontdekken van nieuwe films én om persoonlijke profielen bij te houden.

---

## 🚀 Functionaliteiten

- 🌟 **Landingpagina** met uitleg en startknop
- 🎭 **Genres kiezen**: selecteer tussen 1 en 3 genres
- 🎬 **Filmsuggesties** op basis van jouw selectie
- 🔁 **Shuffle-knop** voor nieuwe aanbevelingen
- 📺 **Platform-informatie** (bijv. Netflix, Disney+)
- 🔐 **Registratie en login** via Supabase
- 👤 **Profielpagina** met gebruikersnaam, bio en profielfoto
- 📷 **Upload je eigen avatar**
- 🔒 Alleen toegang tot profiel als je bent ingelogd

---

## 🧰 Technologieën

- HTML, CSS, JavaScript
- Tailwind CSS voor styling
- Supabase (Auth, Database, Storage)
- TMDB API voor filmdata

---

## 📦 Installatie

1. Clone de repository:
```bash
git clone https://github.com/Rickoo97/MovieMatch.git
```
2. Open de map in Visual Studio Code
3. Start Live Server (of open index.html handmatig in je browser)

---

## 🛠 Configuratie

1. Maak een Supabase-project aan via [supabase.com](https://supabase.com)
2. Voeg een table `profiles` toe met kolommen:
   - `id` (UUID, Primary Key)
   - `username` (text)
   - `bio` (text)
   - `avatar_url` (text)
3. Maak een Storage Bucket `avatars`
4. Zet policies aan (zie projectdocumentatie of vraag het aan de ontwikkelaar 😉)
5. Voeg je Supabase URL en Anon Key in bij `supabase.createClient()`

---

## 📸 Screenshots
> *(voeg hier eventueel afbeeldingen toe van index.html, profielpagina, enz.)*

---

## 📃 Licentie
MIT License

---

## 🙋‍♂️ Auteur
**Rickoo97** – [github.com/Rickoo97](https://github.com/Rickoo97)

Feedback of ideeën? Open een issue of stuur een pull request! ✌️
