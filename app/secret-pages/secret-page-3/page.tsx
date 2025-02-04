// app/private/secret-page-3/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import FriendsList from '@/components/FriendsList'
import FriendSecretMessage from '@/components/FriendSecretMessage'
import SecretMessage from '@/components/SecretMessage'

export default function SecretPage3() {
  const supabase = createClient()
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

  if (loading) return <div>Loading user information...</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Secret Page 3 - Friends System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border-r pr-4">
          <h2 className="text-lg font-semibold mb-4">Your Friends</h2>
          <FriendsList 
            userId={userId}
            onFriendSelect={setSelectedFriend}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Friend's Secret</h2>
          {selectedFriend ? (
            <FriendSecretMessage 
              currentUserId={userId}
              friendId={selectedFriend}
            />
          ) : (
            <div className="text-gray-500">
              Select a friend from the list to view their secret
            </div>
          )}
        </div>
      </div>
      <SecretMessage userId={userId} allowEdit={true} />
    </div>
  )
}