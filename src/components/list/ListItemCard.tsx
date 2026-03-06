"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { forwardRef } from "react";

interface ListItemCardProps {
  rank: number;
  title: string;
  subtitle?: string | null;
  imageUrl?: string | null;
  note?: string | null;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onRemove?: () => void;
  className?: string;
}

const ListItemCard = forwardRef<HTMLDivElement, ListItemCardProps>(
  (
    {
      rank,
      title,
      subtitle,
      imageUrl,
      note,
      isDragging,
      dragHandleProps,
      onRemove,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-3 rounded-xl bg-white p-3 dark:bg-zinc-900",
          isDragging
            ? "shadow-lg ring-2 ring-violet-500/30 scale-[1.02]"
            : "shadow-sm border border-zinc-100 dark:border-zinc-800",
          "transition-shadow",
          className
        )}
      >
        {dragHandleProps && (
          <button
            className="flex-shrink-0 touch-none cursor-grab active:cursor-grabbing p-1 text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400"
            {...dragHandleProps}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zm-6 5h2v2H8v-2zm6 0h2v2h-2v-2z" />
            </svg>
          </button>
        )}

        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
          {rank}
        </div>

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={48}
            height={48}
            className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800">
            <svg
              className="h-5 w-5 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
          {note && (
            <p className="mt-0.5 truncate text-xs italic text-zinc-400 dark:text-zinc-500">
              {note}
            </p>
          )}
        </div>

        {onRemove && (
          <button
            onClick={onRemove}
            className="flex-shrink-0 rounded-full p-1 text-zinc-300 hover:text-red-500 hover:bg-red-50 dark:text-zinc-600 dark:hover:text-red-400 dark:hover:bg-red-900/20"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

ListItemCard.displayName = "ListItemCard";
export default ListItemCard;
