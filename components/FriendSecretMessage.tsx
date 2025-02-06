// components/FriendSecretMessage.tsx
'use client'

import { supabase } from '@/lib/supabase/supabaseClient'
import { useEffect, useState } from 'react'
import SecretMessage from './SecretMessage'

export default function FriendSecretMessage({ 
  currentUserId,
  friendId
}: {
  currentUserId: string
  friendId: string
}) {
  const [hasAccess, setHasAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('friends')
          .select('status')
          // Corrected filter syntax for OR of two AND conditions
          .or(`and(user_id.eq.${currentUserId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${currentUserId})`)
          .eq('status', 'accepted')
          .single();
    
        setHasAccess(!!data && !error);
        setError('');
      } catch (err) {
        setError('Failed to verify access');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId && friendId) {
      verifyAccess()
    }
  }, [currentUserId, friendId])

  if (loading) return <div>Checking permissions...</div>
  if (error) return <div className="text-red-500">{error}</div>
  
  return hasAccess ? (
    <SecretMessage userId={friendId} allowEdit={false} />
  ) : (
    <div className="text-red-500">
      You don't have permission to view this secret!
    </div>
  )
}