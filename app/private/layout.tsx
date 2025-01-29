// app/private/layout.tsx
import AuthButton from '@/components/AuthButton'
import Link from 'next/link'
import AuthProvider from '@/components/AuthProvider'
import AuthLoader from '@/components/AuthLoader'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthLoader>
    <AuthProvider>
    <div className="flex-1 w-full flex flex-col gap-8 items-center">
      <nav className="w-full border-b">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
          <div className="flex gap-4">
            <Link href="/private/secret-page-1" className="hover:text-blue-600">
              Page 1
            </Link>
            <Link href="/private/secret-page-2" className="hover:text-blue-600">
              Page 2
            </Link>
            <Link href="/private/secret-page-3" className="hover:text-blue-600">
              Page 3
            </Link>
          </div>
          <AuthButton />
        </div>
      </nav>
      <main className="w-full max-w-4xl px-4">{children}</main>
    </div>
    </AuthProvider>
    </AuthLoader>
  )
}