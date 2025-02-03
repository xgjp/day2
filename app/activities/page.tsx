// app/activities/page.tsx
import Link from 'next/link';

export default function ActivitiesIndex() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Activities</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link href="/activities/todo" className="text-blue-500 hover:underline">
            To-Do List App
          </Link>
        </li>
        <li>
          <Link href="/activities/drive" className="text-blue-500 hover:underline">
            Google Drive Lite
          </Link>
        </li>
        <li>
          <Link href="/activities/food-review" className="text-blue-500 hover:underline">
            Food Review App
          </Link>
        </li>
        <li>
          <Link href="/activities/pokemon" className="text-blue-500 hover:underline">
            Pokémon Review App
          </Link>
        </li>
        <li>
          <Link href="/activities/notes" className="text-blue-500 hover:underline">
            Markdown Notes App
          </Link>
        </li>
      </ul>
    </div>
  );
}
