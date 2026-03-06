import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";

export const metadata: Metadata = {
  title: "Taste Lists - Share Your Taste",
  description:
    "Create beautiful ranked lists of your favorite movies, TV shows, and music. Share your taste with the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Navbar />
        <main className="mx-auto min-h-screen max-w-2xl px-4 py-6">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
