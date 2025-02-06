// components/FriendsList.tsx
'use client'

import { supabase } from '@/lib/supabase/supabaseClient'
import { useEffect, useState } from 'react'

type Friend = {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  user_email?: string
  sender?: { email: string }[]
  receiver?: { email: string }[]
}

export default function Friends({ 
  userId, 
  onFriendSelect 
}: { 
  userId: string
  onFriendSelect?: (friendId: string) => void 
}) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [requests, setRequests] = useState<Friend[]>([])
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const loadFriends = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        sender:sender_id(email),
        receiver:receiver_id(email)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq('status', 'accepted')

    if (error) {
      setError('Failed to load friends')
      return
    }

    setFriends(data || [])
  }

  const loadRequests = async () => {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        sender:sender_id(email)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending')

    if (error) {
      setError('Failed to load requests')
      return
    }

    setRequests(data || [])
  }

  const sendRequest = async (email: string) => {
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (userError || !users) {
      setError('User not found')
      return
    }

    const { error } = await supabase
      .from('friends')
      .insert({
        sender_id: userId,
        receiver_id: users.id,
      })

    if (error) {
      setError('Failed to send request')
      return
    }

    setEmail('')
    loadRequests()
  }

  const acceptRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (error) {
      setError('Failed to accept request')
      return
    }

    loadRequests()
    loadFriends()
  }

  useEffect(() => {
    if (!userId) return
  
    loadFriends()
    loadRequests()
  
    const channel = supabase
      .channel('friends_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friends' },
        (payload) => {
          console.log('Friend request change detected:', payload)
          loadFriends()
          loadRequests()
        }
      )
      .subscribe()
  
    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Add Friend</h3>
        <div className="flex gap-2 mt-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={() => sendRequest(email)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Send Request
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {requests.length > 0 && (
        <div>
          <h3 className="text-lg font-medium">Friend Requests</h3>
          <div className="space-y-2 mt-2">
            {requests.map((request) => (
              <div key={request.id} className="flex justify-between items-center p-3 border rounded">
                <span>{request.sender?.[0]?.email}</span>
                <button
                  onClick={() => acceptRequest(request.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium">Friends</h3>
        <div className="space-y-2 mt-2">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onFriendSelect?.(friend.sender_id === userId ? friend.receiver_id : friend.sender_id)}
              className="w-full p-3 border rounded text-left hover:bg-gray-50"
            >
              {friend.sender_id === userId ? friend.receiver?.[0]?.email : friend.sender?.[0]?.email}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}