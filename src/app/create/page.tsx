"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Category, CATEGORIES, SearchResult } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SortableList from "@/components/list/SortableList";
import ItemSearchModal from "@/components/list/ItemSearchModal";

interface DraftItem {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  external_id: string;
  metadata: Record<string, unknown>;
  note?: string | null;
}

export default function CreatePage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<"category" | "details" | "items">(
    "category"
  );
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<DraftItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (userLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  function handleAddItem(result: SearchResult) {
    setItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: result.title,
        subtitle: result.subtitle,
        image_url: result.image_url,
        external_id: result.external_id,
        metadata: result.metadata,
        note: result.note || null,
      },
    ]);
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleSave() {
    if (!category || !title.trim() || items.length === 0) return;
    setSaving(true);
    setError("");

    try {
      const supabase = createClient();

      // Create the list
      const { data: list, error: listError } = await supabase
        .from("lists")
        .insert({
          user_id: user!.id,
          title: title.trim(),
          description: description.trim() || null,
          category,
          cover_image_url: items[0]?.image_url || null,
          is_public: true,
        })
        .select()
        .single();

      if (listError) throw listError;

      // Create list items
      const listItems = items.map((item, index) => ({
        list_id: list.id,
        rank: index + 1,
        title: item.title,
        subtitle: item.subtitle,
        image_url: item.image_url,
        external_id: item.external_id,
        metadata: item.metadata,
        note: item.note || null,
      }));

      const { error: itemsError } = await supabase
        .from("list_items")
        .insert(listItems);

      if (itemsError) throw itemsError;

      router.push(`/list/${list.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save list";
      setError(message);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      {/* Step: Pick category */}
      {step === "category" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              New List
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              What kind of list do you want to make?
            </p>
          </div>
          <div className="grid gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => {
                  setCategory(cat.value);
                  setStep("details");
                }}
                className="flex items-center gap-4 rounded-2xl border border-zinc-100 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md hover:border-zinc-200 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {cat.label}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {cat.value === "movies" && "Rank your favorite films"}
                    {cat.value === "tv" && "Rank your favorite shows"}
                    {cat.value === "music" && "Rank albums and songs"}
                  </p>
                </div>
                <svg
                  className="ml-auto h-5 w-5 text-zinc-300"
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
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Title & description */}
      {step === "details" && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Name Your List
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Give it a catchy title
            </p>
          </div>
          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === "movies"
                  ? "e.g. Top 25 Movies of All Time"
                  : category === "tv"
                    ? "e.g. Shows Everyone Should Watch"
                    : "e.g. My Favorite Albums"
              }
              autoFocus
              maxLength={100}
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description (optional)"
              rows={2}
              maxLength={500}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep("category")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={() => setStep("items")}
              disabled={!title.trim()}
              className="flex-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step: Add & rank items */}
      {step === "items" && category && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
              <p className="text-sm text-zinc-500">
                {items.length} item{items.length !== 1 ? "s" : ""} — drag to
                reorder
              </p>
            </div>
            <Button size="sm" onClick={() => setShowSearch(true)}>
              + Add
            </Button>
          </div>

          {items.length > 0 ? (
            <SortableList
              items={items}
              onReorder={(newItems) => setItems(newItems as DraftItem[])}
              onRemove={handleRemoveItem}
            />
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="w-full rounded-2xl border-2 border-dashed border-zinc-200 py-12 text-center text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-600"
            >
              <svg
                className="mx-auto mb-2 h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-sm font-medium">Add your first item</p>
            </button>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setStep("details")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleSave}
              disabled={items.length === 0 || saving}
              className="flex-1"
            >
              {saving ? "Saving..." : "Publish List"}
            </Button>
          </div>

          <ItemSearchModal
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
            category={category}
            onAdd={handleAddItem}
            existingIds={new Set(items.map((i) => i.external_id))}
          />
        </div>
      )}
    </div>
  );
}
