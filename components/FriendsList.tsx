// components/FriendsList.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function FriendsList({ 
  userId,
  onSelectFriend
}: {
  userId: string
  onSelectFriend: (friendId: string) => void
}) {
  const supabase = createClient()
  const [friends, setFriends] = useState<{ id: string, email: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFriends = async () => {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          id,
          status,
          requester:user_id(email),
          receiver:friend_id(email)
        `)
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (data) {
        const formattedFriends = data.map(f => ({
          id: f.id,
          email: f.requester.email === userId ? f.receiver.email : f.requester.email
        }))
        setFriends(formattedFriends)
      }
      setLoading(false)
    }

    loadFriends()
  }, [userId])

  return (
    <div className="space-y-2">
      {loading ? (
        <div>Loading friends...</div>
      ) : (
        friends.map(friend => (
          <button
            key={friend.id}
            onClick={() => onSelectFriend(friend.id)}
            className="block p-2 hover:bg-gray-100 w-full text-left rounded"
          >
            {friend.email}
          </button>
        ))
      )}
    </div>
  )
}