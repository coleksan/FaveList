import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileListGrid from "@/components/profile/ProfileListGrid";
import { ListWithStats } from "@/types";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) notFound();

  // Fetch user's lists with stats
  const { data: lists } = await supabase
    .from("list_with_stats")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  // Fetch follower/following counts
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", profile.id);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", profile.id);

  return (
    <div className="space-y-6">
      <ProfileHeader
        profile={profile}
        listCount={lists?.length || 0}
        followerCount={followerCount || 0}
        followingCount={followingCount || 0}
      />
      <ProfileListGrid lists={(lists as ListWithStats[]) || []} />
    </div>
  );
}
