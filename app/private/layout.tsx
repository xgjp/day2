import AuthButton from '@/components/AuthButton'

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div className="flex gap-4">
            <a href="/private/secret-page-1">Page 1</a>
            <a href="/private/secret-page-2">Page 2</a>
            <a href="/private/secret-page-3">Page 3</a>
          </div>
          <AuthButton />
        </div>
      </nav>
      {children}
    </div>
  )
}