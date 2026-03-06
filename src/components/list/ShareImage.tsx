"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import { ListItem, Category, CATEGORIES } from "@/types";
import Button from "@/components/ui/Button";

interface ShareImageProps {
  title: string;
  category: Category;
  username: string;
  items: ListItem[];
}

export default function ShareImage({
  title,
  category,
  username,
  items,
}: ShareImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const cat = CATEGORIES.find((c) => c.value === category);

  async function handleExport() {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 2,
        backgroundColor: "#18181b",
      });
      const link = document.createElement("a");
      link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export image:", err);
    }
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button onClick={handleExport} size="sm" variant="secondary">
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save Image
        </Button>
        <Button onClick={handleCopyLink} size="sm" variant="ghost">
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy Link
        </Button>
      </div>

      {/* Hidden shareable card */}
      <div className="overflow-hidden rounded-2xl">
        <div
          ref={ref}
          className="w-[400px] bg-zinc-900 p-6 text-white"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
            {cat?.icon} {cat?.label}
          </div>
          <h2 className="mb-1 text-xl font-bold">{title}</h2>
          <p className="mb-4 text-sm text-zinc-400">by @{username}</p>

          <div className="space-y-2">
            {items.slice(0, 10).map((item, i) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="w-6 text-right text-sm font-bold text-zinc-500">
                  {i + 1}
                </span>
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  {item.subtitle && (
                    <p className="truncate text-xs text-zinc-400">
                      {item.subtitle}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {items.length > 10 && (
              <p className="text-center text-xs text-zinc-500">
                +{items.length - 10} more
              </p>
            )}
          </div>

          <div className="mt-4 border-t border-zinc-800 pt-3 text-center text-xs text-zinc-600">
            Taste Lists
          </div>
        </div>
      </div>
    </div>
  );
}
