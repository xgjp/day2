'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FriendsList({ userId }: { userId: string }) {
  const supabase = createClient()
  const [friends, setFriends] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      // Get friend requests
      const { data: incomingRequests } = await supabase
        .from('friends')
        .select('*')
        .eq('friend_id', userId)
        .eq('status', 'pending')

      // Get accepted friends
      const { data: acceptedFriends } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      setRequests(incomingRequests || [])
      setFriends(acceptedFriends || [])
    }

    loadData()
  }, [userId])

  const handleAcceptRequest = async (requestId: string) => {
    await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
    
    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  return (
    <div className="flex gap-8">
      <div>
        <h2>Friend Requests</h2>
        {requests.map(request => (
          <div key={request.id} className="flex gap-2">
            <p>{request.user_id}</p>
            <button 
              onClick={() => handleAcceptRequest(request.id)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Accept
            </button>
          </div>
        ))}
      </div>
      
      <div>
        <h2>Your Friends</h2>
        {friends.map(friend => (
          <div key={friend.id}>
            {friend.user_id === userId ? friend.friend_id : friend.user_id}
          </div>
        ))}
      </div>
    </div>
  )
}