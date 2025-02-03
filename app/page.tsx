
// app/layout.tsx
import { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 text-white p-4 flex justify-between">
        <div>
          <Link href="/">🏠 Home</Link>
        </div>
        <div className="flex gap-4">
          <Link href="/secret-pages">🔒 Secret Pages</Link>
          <Link href="/activities">🎮 Activities</Link>
        </div>
      </nav>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}

