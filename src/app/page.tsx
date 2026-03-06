import { createClient } from "@/lib/supabase/server";
import ListCard from "@/components/list/ListCard";
import { ListWithStats } from "@/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: lists } = await supabase
    .from("list_with_stats")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Share Your Taste
        </h1>
        <p className="mt-2 text-zinc-500">
          Create beautiful ranked lists of your favorite things.
        </p>
        <Link
          href="/create"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create Your First List
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Feed */}
      {lists && lists.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {(lists as ListWithStats[]).map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <p className="text-lg font-medium text-zinc-400">No lists yet</p>
          <p className="mt-1 text-sm text-zinc-400">
            Be the first to create one!
          </p>
        </div>
      )}
    </div>
  );
}
