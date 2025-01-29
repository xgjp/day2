// app/private/secret-page-1/page.tsx
import { createClient } from '@/lib/supabase/server'
import SecretMessage from '@/components/SecretMessage'

export default async function SecretPage1() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Secret Page 1</h1>
      <SecretMessage userId={user?.id!} />
    </div>
  )
}