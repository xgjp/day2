// app/private/secret-page-3/page.tsx
'use client'

import { supabase } from '@/lib/supabase/supabaseClient'
import { useEffect, useState } from 'react'
import FriendsList from '@/components/FriendsList'
import FriendSecretMessage from '@/components/FriendSecretMessage'
import SecretMessage from '@/components/SecretMessage'

export default function SecretPage3() {
  const [userId, setUserId] = useState<string>('')
  const [selectedFriend, setSelectedFriend] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || '')
      setLoading(false)
    }
    fetchUser()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Secret Page 3</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FriendsList userId={userId} />
        
        <div>
          <SecretMessage userId={userId} allowEdit={true} />
          {selectedFriend && (
            <FriendSecretMessage 
              currentUserId={userId}
              friendId={selectedFriend}
            />
          )}
        </div>
      </div>
    </div>
  )
}