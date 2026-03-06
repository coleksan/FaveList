export type Category = "movies" | "tv" | "music";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface List {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: Category;
  cover_image_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  rank: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  external_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ListWithStats extends List {
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  item_count: number;
  like_count: number;
}

export interface SearchResult {
  external_id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
}

export const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "movies", label: "Movies", icon: "🎬" },
  { value: "tv", label: "TV Shows", icon: "📺" },
  { value: "music", label: "Music", icon: "🎵" },
];
