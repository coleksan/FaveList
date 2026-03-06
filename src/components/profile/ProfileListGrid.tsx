import { ListWithStats } from "@/types";
import ListCard from "@/components/list/ListCard";

interface ProfileListGridProps {
  lists: ListWithStats[];
}

export default function ProfileListGrid({ lists }: ProfileListGridProps) {
  if (lists.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-zinc-400">No lists yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {lists.map((list) => (
        <ListCard key={list.id} list={list} />
      ))}
    </div>
  );
}
