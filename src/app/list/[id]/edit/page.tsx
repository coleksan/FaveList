"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { Category, SearchResult } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SortableList from "@/components/list/SortableList";
import ItemSearchModal from "@/components/list/ItemSearchModal";

interface EditItem {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url?: string | null;
  external_id: string;
  metadata: Record<string, unknown>;
}

export default function EditListPage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<EditItem[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadList() {
      const supabase = createClient();
      const { data: list } = await supabase
        .from("lists")
        .select("*")
        .eq("id", id)
        .single();

      if (!list) {
        router.push("/");
        return;
      }

      setTitle(list.title);
      setDescription(list.description || "");
      setCategory(list.category as Category);

      const { data: listItems } = await supabase
        .from("list_items")
        .select("*")
        .eq("list_id", id)
        .order("rank", { ascending: true });

      setItems(
        (listItems || []).map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          image_url: item.image_url,
          external_id: item.external_id || "",
          metadata: item.metadata || {},
        }))
      );
      setLoading(false);
    }

    loadList();
  }, [id, router]);

  if (userLoading || loading) {
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
        id: `new_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: result.title,
        subtitle: result.subtitle,
        image_url: result.image_url,
        external_id: result.external_id,
        metadata: result.metadata,
      },
    ]);
  }

  function handleRemoveItem(itemId: string) {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }

  async function handleSave() {
    if (!title.trim() || items.length === 0) return;
    setSaving(true);

    try {
      const supabase = createClient();

      // Update list
      await supabase
        .from("lists")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          cover_image_url: items[0]?.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Delete existing items and re-insert
      await supabase.from("list_items").delete().eq("list_id", id);

      const listItems = items.map((item, index) => ({
        list_id: id,
        rank: index + 1,
        title: item.title,
        subtitle: item.subtitle,
        image_url: item.image_url,
        external_id: item.external_id,
        metadata: item.metadata,
      }));

      await supabase.from("list_items").insert(listItems);

      router.push(`/list/${id}`);
    } catch (err) {
      console.error("Failed to save:", err);
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
        Edit List
      </h1>

      <div className="space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="List title"
          maxLength={100}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          maxLength={500}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {items.length} item{items.length !== 1 ? "s" : ""} — drag to reorder
        </p>
        <Button size="sm" onClick={() => setShowSearch(true)}>
          + Add
        </Button>
      </div>

      <SortableList
        items={items}
        onReorder={(newItems) => setItems(newItems as EditItem[])}
        onRemove={handleRemoveItem}
      />

      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => router.push(`/list/${id}`)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={items.length === 0 || saving}
          className="flex-1"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {category && (
        <ItemSearchModal
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          category={category}
          onAdd={handleAddItem}
          existingIds={new Set(items.map((i) => i.external_id))}
        />
      )}
    </div>
  );
}
