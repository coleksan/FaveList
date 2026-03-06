import { CATEGORIES, Category } from "@/types";
import Avatar from "@/components/ui/Avatar";
import Link from "next/link";

interface ListHeaderProps {
  title: string;
  description?: string | null;
  category: Category;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  itemCount: number;
  likeCount: number;
}

export default function ListHeader({
  title,
  description,
  category,
  username,
  displayName,
  avatarUrl,
  itemCount,
  likeCount,
}: ListHeaderProps) {
  const cat = CATEGORIES.find((c) => c.value === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
          {cat?.icon} {cat?.label}
        </span>
        <span className="text-xs text-zinc-400">
          {itemCount} items
        </span>
        <span className="text-xs text-zinc-400">
          {likeCount} likes
        </span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h1>

      {description && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}

      <Link
        href={`/profile/${username}`}
        className="inline-flex items-center gap-2 rounded-full pr-3 hover:bg-zinc-50 dark:hover:bg-zinc-800"
      >
        <Avatar
          src={avatarUrl}
          name={displayName || username}
          size="sm"
        />
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {displayName || username}
        </span>
      </Link>
    </div>
  );
}
