"use client";

import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const { user, profile, loading } = useUser();

  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Taste Lists
        </Link>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user && profile ? (
                <>
                  <Link href="/create">
                    <Button size="sm" className="rounded-full">
                      <svg
                        className="mr-1 h-4 w-4"
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
                      New List
                    </Button>
                  </Link>
                  <Link href={`/profile/${profile.username}`}>
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.display_name || profile.username}
                      size="sm"
                    />
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm">Sign In</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
