import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ListHeader from "@/components/list/ListHeader";
import ListItemCard from "@/components/list/ListItemCard";
import ShareImageWrapper from "./ShareImageWrapper";
import LikeButton from "./LikeButton";
import { Category, ListItem } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ListPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch list with user info
  const { data: list } = await supabase
    .from("lists")
    .select("*, profiles(username, display_name, avatar_url)")
    .eq("id", id)
    .single();

  if (!list) notFound();

  // Fetch items ordered by rank
  const { data: items } = await supabase
    .from("list_items")
    .select("*")
    .eq("list_id", id)
    .order("rank", { ascending: true });

  // Fetch like count
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("list_id", id);

  const profile = list.profiles as unknown as {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };

  return (
    <div className="space-y-6">
      <ListHeader
        title={list.title}
        description={list.description}
        category={list.category as Category}
        username={profile.username}
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        itemCount={items?.length || 0}
        likeCount={likeCount || 0}
      />

      <LikeButton listId={id} initialLikeCount={likeCount || 0} />

      <div className="space-y-2">
        {(items as ListItem[])?.map((item) => (
          <ListItemCard
            key={item.id}
            rank={item.rank}
            title={item.title}
            subtitle={item.subtitle}
            imageUrl={item.image_url}
          />
        ))}
      </div>

      <div className="border-t border-zinc-100 pt-6 dark:border-zinc-800">
        <h3 className="mb-3 text-sm font-medium text-zinc-500">Share this list</h3>
        <ShareImageWrapper
          title={list.title}
          category={list.category as Category}
          username={profile.username}
          items={(items as ListItem[]) || []}
        />
      </div>
    </div>
  );
}
