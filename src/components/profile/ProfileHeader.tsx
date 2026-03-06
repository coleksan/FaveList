"use client";

import { Profile } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { useState, useEffect } from "react";

interface ProfileHeaderProps {
  profile: Profile;
  listCount: number;
  followerCount: number;
  followingCount: number;
}

export default function ProfileHeader({
  profile,
  listCount,
  followerCount: initialFollowerCount,
  followingCount,
}: ProfileHeaderProps) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const isOwnProfile = user?.id === profile.id;

  useEffect(() => {
    if (!user || isOwnProfile) return;
    const supabase = createClient();
    supabase
      .from("follows")
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .single()
      .then(({ data }) => setIsFollowing(!!data));
  }, [user, profile.id, isOwnProfile]);

  async function toggleFollow() {
    if (!user) return;
    const supabase = createClient();
    if (isFollowing) {
      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", profile.id);
      setIsFollowing(false);
      setFollowerCount((c) => c - 1);
    } else {
      await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: profile.id });
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Avatar
        src={profile.avatar_url}
        name={profile.display_name || profile.username}
        size="lg"
      />
      <div className="text-center">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {profile.display_name || profile.username}
        </h1>
        <p className="text-sm text-zinc-500">@{profile.username}</p>
        {profile.bio && (
          <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            {profile.bio}
          </p>
        )}
      </div>

      <div className="flex gap-6 text-center">
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {listCount}
          </p>
          <p className="text-xs text-zinc-500">Lists</p>
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {followerCount}
          </p>
          <p className="text-xs text-zinc-500">Followers</p>
        </div>
        <div>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {followingCount}
          </p>
          <p className="text-xs text-zinc-500">Following</p>
        </div>
      </div>

      {!isOwnProfile && user && (
        <Button
          onClick={toggleFollow}
          variant={isFollowing ? "secondary" : "primary"}
          size="sm"
        >
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}

      {isOwnProfile && (
        <Button
          variant="secondary"
          size="sm"
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          Sign Out
        </Button>
      )}
    </div>
  );
}
