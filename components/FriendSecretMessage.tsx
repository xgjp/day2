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
  const [hasAccess, setHasAccess] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Optional: You can still log errors if necessary
    console.log('Bypassing permission check for testing');
    setLoading(false); // End loading as soon as this runs
  }, []);

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