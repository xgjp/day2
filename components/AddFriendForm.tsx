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
      // Find user by email
      const { data: foundUsers, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)

      if (findError || !foundUsers?.[0]?.id) {
        throw new Error('User not found')
      }

      const friendId = foundUsers[0].id

      // Create friend request
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
    } catch (err) {
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