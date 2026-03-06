import { ListWithStats, CATEGORIES } from "@/types";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

interface ListCardProps {
  list: ListWithStats;
}

export default function ListCard({ list }: ListCardProps) {
  const category = CATEGORIES.find((c) => c.value === list.category);

  return (
    <Link href={`/list/${list.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
        {/* Cover image area */}
        <div className="relative aspect-[16/9] bg-gradient-to-br from-violet-500/20 via-pink-500/20 to-orange-500/20">
          {list.cover_image_url && (
            <Image
              src={list.cover_image_url}
              alt={list.title}
              fill
              className="object-cover"
            />
          )}
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-zinc-700 backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-300">
              {category?.icon} {category?.label}
            </span>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-zinc-900 group-hover:text-violet-600 dark:text-zinc-100 dark:group-hover:text-violet-400">
            {list.title}
          </h3>
          {list.description && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
              {list.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar
                src={list.avatar_url}
                name={list.display_name || list.username}
                size="sm"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {list.display_name || list.username}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-400">
              <span>{list.item_count} items</span>
              <span>{list.like_count} likes</span>
            </div>
          </div>

          <p className="mt-2 text-xs text-zinc-400">
            {timeAgo(list.created_at)}
          </p>
        </div>
      </div>
    </Link>
  );
}
