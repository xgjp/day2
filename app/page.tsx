// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to the NextJS & Supabase App!</h1>
      <p className="mb-6">
        This is the home page where you can navigate to various sections of the application.
      </p>
      <div className="space-y-4">
        <Link href="/activities" className="text-blue-500 hover:underline text-xl block">
          🎮 Go to Activities App
        </Link>
        <Link href="/secret-pages" className="text-blue-500 hover:underline text-xl block">
          🔒 Go to Secret Pages (Beta)
        </Link>
      </div>
    </div>
  );
}
