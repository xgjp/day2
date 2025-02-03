// components/AddFriendForm.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function AddFriendForm({ userId }: { userId: string }) {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim()
      
      // Search using case-insensitive comparison
      const { data: foundUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .ilike('email', normalizedEmail) // Case-insensitive search
        .maybeSingle()

      if (findError || !foundUser?.id) {
        throw new Error('User with this email not found')
      }

      const friendId = foundUser.id

      // Prevent self-requests
      if (friendId === userId) {
        throw new Error('Cannot add yourself as a friend')
      }

      // Check existing requests
      const { data: existing } = await supabase
        .from('friends')
        .select()
        .or(
          `and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`
        )

      if (existing?.length) {
        throw new Error('Friend request already exists')
      }

      // Create request
      const { error: requestError } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        })

      if (requestError) throw requestError

      alert('Friend request sent!')
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Failed to send request')
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
    </form>
  )
}