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
        <div>
          <Link href="/activities">
            <a className="text-blue-500 hover:underline text-xl">
              🎮 Go to Activities App
            </a>
          </Link>
        </div>
        <div>
          <Link href="/secret-pages">
            <a className="text-blue-500 hover:underline text-xl">
              🔒 Go to Secret Pages (Beta)
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
