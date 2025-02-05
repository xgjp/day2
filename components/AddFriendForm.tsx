'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AddFriendForm({ userId }: { userId: string }) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Function to search for a user by email
  const searchUser = async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim()) // Ensure case-insensitive search
      .single()

    if (error || !data) {
      setError("User not found. Ensure they have signed up.")
      return null
    }
    return data.id
  }

  // Function to send a friend request
  const sendFriendRequest = async (friendId: string) => {
    if (!friendId) return

    // Prevent self-requests
    if (friendId === userId) {
      setError("You can't add yourself as a friend.")
      return
    }

    // Check if friend request already exists
    const { data: existing, error: existingError } = await supabase
    .from('friends')
    .select('id') // Select only necessary columns
    .or(`user_id.eq.${userId}, user_id.eq.${friendId}`)
    .or(`friend_id.eq.${friendId}, friend_id.eq.${userId}`);
  
  if (existingError) {
    console.error("Error checking existing requests:", existingError);
    setError(`Error checking existing requests: ${existingError.message}`);
    return;
  }
  
  // If a friend request already exists, prevent duplicate requests
  if (existing && existing.length > 0) {
    setError("Friend request already exists.");
    return;
  }
    // Insert friend request
    const { error: requestError } = await supabase
      .from('friends')
      .insert([{ user_id: userId, friend_id: friendId, status: 'pending' }])

    if (requestError) {
      setError("Error sending request.")
    } else {
      setSuccess("Friend request sent!")
      setEmail('')
    }
  }

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const friendId = await searchUser(email)
      if (friendId) {
        await sendFriendRequest(friendId)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter friend's email"
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Friend Request'}
      </button>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-500 text-sm">{success}</div>}
    </form>
  )
}
