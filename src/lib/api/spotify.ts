import { SearchResult } from "@/types";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export async function searchMusic(query: string): Promise<SearchResult[]> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album,track&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();

  const albums: SearchResult[] = (data.albums?.items || []).map(
    (a: {
      id: string;
      name: string;
      artists: { name: string }[];
      images: { url: string }[];
      release_date?: string;
    }) => ({
      external_id: `album:${a.id}`,
      title: a.name,
      subtitle: a.artists.map((ar) => ar.name).join(", "),
      image_url: a.images?.[0]?.url || null,
      metadata: {
        type: "album",
        artist: a.artists.map((ar) => ar.name).join(", "),
        year: a.release_date?.slice(0, 4),
      },
    })
  );

  const tracks: SearchResult[] = (data.tracks?.items || []).map(
    (t: {
      id: string;
      name: string;
      artists: { name: string }[];
      album: { images: { url: string }[]; name: string };
    }) => ({
      external_id: `track:${t.id}`,
      title: t.name,
      subtitle: t.artists.map((ar) => ar.name).join(", "),
      image_url: t.album?.images?.[0]?.url || null,
      metadata: {
        type: "track",
        artist: t.artists.map((ar) => ar.name).join(", "),
        album: t.album?.name,
      },
    })
  );

  return [...albums, ...tracks];
}
