"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  listId: string;
  initialLikeCount: number;
}

export default function LikeButton({
  listId,
  initialLikeCount,
}: LikeButtonProps) {
  const { user } = useUser();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikeCount);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase
      .from("likes")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("list_id", listId)
      .single()
      .then(({ data }) => setLiked(!!data));
  }, [user, listId]);

  async function toggleLike() {
    if (!user) return;
    const supabase = createClient();
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("list_id", listId);
      setLiked(false);
      setCount((c) => c - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ user_id: user.id, list_id: listId });
      setLiked(true);
      setCount((c) => c + 1);
    }
  }

  return (
    <button
      onClick={toggleLike}
      disabled={!user}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        liked
          ? "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
          : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600"
      )}
    >
      <svg
        className="h-4 w-4"
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count}
    </button>
  );
}
