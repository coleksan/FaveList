"use client";

import { useState, useCallback, useRef } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
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
  const [mode, setMode] = useState<"manual" | "search">("manual");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Manual form fields
  const [manualTitle, setManualTitle] = useState("");
  const [manualSubtitle, setManualSubtitle] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [manualNote, setManualNote] = useState("");

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(
          `${API_ROUTES[category]}?q=${encodeURIComponent(q)}`
        );
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

  function handleSearchInput(value: string) {
    setQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(value), 300);
  }

  function handleAddManual() {
    if (!manualTitle.trim()) return;
    onAdd({
      external_id: `manual_${Date.now()}`,
      title: manualTitle.trim(),
      subtitle: manualSubtitle.trim() || null,
      image_url: manualImageUrl.trim() || null,
      metadata: { manual: true },
      note: manualNote.trim() || null,
    });
    setManualTitle("");
    setManualSubtitle("");
    setManualImageUrl("");
    setManualNote("");
  }

  const categoryLabel =
    category === "tv"
      ? "TV show"
      : category === "movies"
        ? "movie"
        : "song or album";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add ${categoryLabel}`}>
      {mode === "manual" ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Name
            </label>
            <Input
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. The Shining"
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
              placeholder="e.g. Stanley Kubrick, 1980"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Image URL (optional)
            </label>
            <Input
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notes (optional)
            </label>
            <textarea
              value={manualNote}
              onChange={(e) => setManualNote(e.target.value)}
              placeholder="Why you love this one..."
              rows={2}
              maxLength={500}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setMode("search")}
              className="flex-1"
            >
              Search instead
            </Button>
            <Button
              onClick={handleAddManual}
              disabled={!manualTitle.trim()}
              className="flex-1"
            >
              Add item
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Input
            value={query}
            onChange={(e) => handleSearchInput(e.target.value)}
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
            onClick={() => setMode("manual")}
            className="mt-4 w-full rounded-xl border border-dashed border-zinc-300 p-3 text-center text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-300"
          >
            + Add manually
          </button>
        </>
      )}
    </Modal>
  );
}
