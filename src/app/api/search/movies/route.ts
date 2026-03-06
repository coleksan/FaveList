import { searchMovies } from "@/lib/api/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ results: [] });
  }
  const results = await searchMovies(query);
  return NextResponse.json({ results });
}
