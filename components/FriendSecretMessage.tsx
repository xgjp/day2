// components/FriendSecretMessage.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import SecretMessage from './SecretMessage'

export default function FriendSecretMessage({ 
  currentUserId,
  friendId
}: {
  currentUserId: string
  friendId: string
}) {
  const supabase = createClient()
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAccess = async () => {
      const { data, error } = await supabase
        .from('friends')
        .select()
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
        .eq('status', 'accepted')
        .single()

      setHasAccess(!!data && !error)
      setLoading(false)
    }

    verifyAccess()
  }, [currentUserId, friendId])

  if (loading) return <div>Checking permissions...</div>
  
  if (!hasAccess) return (
    <div className="text-red-500">
      You don't have permission to view this secret!
    </div>
  )

  return <SecretMessage userId={friendId} allowEdit={false} />
}