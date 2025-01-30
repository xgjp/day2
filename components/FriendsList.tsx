// components/FriendsList.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import AddFriendForm from './AddFriendForm'
import type { FriendRequest, FriendRelationship } from '@/types'


export default function FriendsList({ 
  userId,
  onFriendSelect
}: {
  userId: string
  onFriendSelect: (friendId: string) => void
}) {
  const supabase = createClient()
  const [friends, setFriends] = useState<Array<{ id: string, email: string
  }>>([]) 
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [showAddFriend, setShowAddFriend] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!userId) {
          setError('No user ID provided')
          return
        }

        // Load friend requests
        const { data: requestsData } = await supabase
          .from('friends')
          .select(`id, status, requester:user_id(email), receiver:friend_id(email)`)
          .eq('friend_id', userId)
          .eq('status', 'pending')
          .returns<FriendRequest[]>()

        // Load accepted friends
        const { data: friendsData } = await supabase
          .from('friends')
          .select(`id, status, user:user_id(id, email), friend:friend_id(id, email)`)
          .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
          .eq('status', 'accepted')
          .returns<FriendRelationship[]>()

        setRequests(requestsData || [])

        const formattedFriends = (friendsData || []).map(relationship => ({
          id: relationship.user.id === userId ? relationship.friend.id : relationship.user.id,
          email: relationship.user.id === userId ? relationship.friend.email : relationship.user.email
        }))

        setFriends(formattedFriends)
        setError('')
      } catch (err) {
        setError('Failed to load friends')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userId])

  return (
    <div className="space-y-4">
    <button
      onClick={() => setShowAddFriend(!showAddFriend)}
      className="bg-green-500 text-white px-4 py-2 rounded"
    >
      {showAddFriend ? 'Cancel' : 'Add Friend'}
    </button>

    {showAddFriend && <AddFriendForm userId={userId} />}
    <div className="space-y-2">
      {loading && <div>Loading friends...</div>}
      {error && <div className="text-red-500">{error}</div>}
      
      {friends.map(friend => (
        <button
          key={friend.id}
          onClick={() => onFriendSelect(friend.id)}
          className="block w-full p-2 text-left hover:bg-gray-100 rounded transition-colors"
        >
          {friend.email}
        </button>
      ))}
      
      {!loading && !error && friends.length === 0 && (
        <div className="text-gray-500">No friends found</div>
      )}
    </div>
  </div>
  )
}