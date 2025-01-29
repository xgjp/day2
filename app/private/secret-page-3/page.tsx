import { createClient } from '@/lib/supabase/server'
import FriendsList from '@/components/FriendsList'

export default async function SecretPage3() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col gap-4">
      <h1>Secret Page 3 - Friends System</h1>
      <FriendsList userId={user?.id} />
    </div>
  )
}