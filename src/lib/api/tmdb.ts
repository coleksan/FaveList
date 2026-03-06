import { SearchResult } from "@/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `${TMDB_BASE}/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
  );
  const data = await res.json();
  return (data.results || []).slice(0, 10).map(
    (m: {
      id: number;
      title: string;
      release_date?: string;
      poster_path?: string;
      overview?: string;
      vote_average?: number;
    }) => ({
      external_id: String(m.id),
      title: m.title,
      subtitle: m.release_date ? m.release_date.slice(0, 4) : null,
      image_url: m.poster_path
        ? `${TMDB_IMAGE_BASE}/w300${m.poster_path}`
        : null,
      metadata: {
        year: m.release_date?.slice(0, 4),
        overview: m.overview,
        rating: m.vote_average,
      },
    })
  );
}

export async function searchTV(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `${TMDB_BASE}/search/tv?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
  );
  const data = await res.json();
  return (data.results || []).slice(0, 10).map(
    (s: {
      id: number;
      name: string;
      first_air_date?: string;
      poster_path?: string;
      overview?: string;
      vote_average?: number;
    }) => ({
      external_id: String(s.id),
      title: s.name,
      subtitle: s.first_air_date ? s.first_air_date.slice(0, 4) : null,
      image_url: s.poster_path
        ? `${TMDB_IMAGE_BASE}/w300${s.poster_path}`
        : null,
      metadata: {
        year: s.first_air_date?.slice(0, 4),
        overview: s.overview,
        rating: s.vote_average,
      },
    })
  );
}
