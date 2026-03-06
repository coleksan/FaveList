"use client";

import { useState, useCallback } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { Category, SearchResult } from "@/types";
import Image from "next/image";

interface ItemSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
  onAdd: (item: SearchResult) => void;
  existingIds: Set<string>;
}

const API_ROUTES: Record<Category, string> = {
  movies: "/api/search/movies",
  tv: "/api/search/tv",
  music: "/api/search/music",
};

export default function ItemSearchModal({
  isOpen,
  onClose,
  category,
  onAdd,
  existingIds,
}: ItemSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualSubtitle, setManualSubtitle] = useState("");

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_ROUTES[category]}?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  // Debounced search on input change
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      const timeout = setTimeout(() => search(value), 300);
      return () => clearTimeout(timeout);
    },
    [search]
  );

  function handleAddManual() {
    if (!manualTitle.trim()) return;
    onAdd({
      external_id: `manual_${Date.now()}`,
      title: manualTitle.trim(),
      subtitle: manualSubtitle.trim() || null,
      image_url: null,
      metadata: { manual: true },
    });
    setManualTitle("");
    setManualSubtitle("");
    setShowManual(false);
  }

  const categoryLabel = category === "tv" ? "TV show" : category === "movies" ? "movie" : "song or album";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add ${categoryLabel}`}>
      {!showManual ? (
        <>
          <Input
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={`Search for a ${categoryLabel}...`}
            autoFocus
          />

          <div className="mt-4 space-y-1">
            {loading && (
              <p className="py-4 text-center text-sm text-zinc-400">
                Searching...
              </p>
            )}
            {!loading && results.length === 0 && query.length > 0 && (
              <p className="py-4 text-center text-sm text-zinc-400">
                No results found
              </p>
            )}
            {results.map((result) => {
              const isAdded = existingIds.has(result.external_id);
              return (
                <button
                  key={result.external_id}
                  disabled={isAdded}
                  onClick={() => onAdd(result)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left hover:bg-zinc-50 disabled:opacity-40 dark:hover:bg-zinc-800"
                >
                  {result.image_url ? (
                    <Image
                      src={result.image_url}
                      alt={result.title}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                      <svg
                        className="h-4 w-4 text-zinc-400"
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
                      {result.title}
                    </p>
                    {result.subtitle && (
                      <p className="truncate text-xs text-zinc-500">
                        {result.subtitle}
                      </p>
                    )}
                  </div>
                  {isAdded ? (
                    <span className="text-xs text-zinc-400">Added</span>
                  ) : (
                    <svg
                      className="h-5 w-5 flex-shrink-0 text-zinc-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowManual(true)}
            className="mt-4 w-full rounded-xl border border-dashed border-zinc-300 p-3 text-center text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
          >
            + Add manually
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Title
            </label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="Enter title"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Subtitle (optional)
            </label>
            <Input
              value={manualSubtitle}
              onChange={(e) => setManualSubtitle(e.target.value)}
              placeholder="e.g. Director, Artist, Year"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowManual(false)}
              className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400"
            >
              Back to search
            </button>
            <button
              onClick={handleAddManual}
              disabled={!manualTitle.trim()}
              className="flex-1 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              Add item
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
