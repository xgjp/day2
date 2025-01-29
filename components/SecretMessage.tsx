// components/SecretMessage.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function SecretMessage({ 
  userId,
  allowEdit = false 
}: {
  userId: string
  allowEdit?: boolean
}) {
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSecret = async () => {
      const { data, error } = await supabase
        .from('secrets')
        .select('message')
        .eq('user_id', userId)
        .single()

      setMessage(error ? '' : data?.message || '')
      setLoading(false)
    }

    fetchSecret()
  }, [userId])

  const handleSave = async (newMessage: string) => {
    if (!userId) return;
    
    const { error } = await supabase
      .from('secrets')
      .upsert({
        user_id: userId,
        message: newMessage
      }, {
        onConflict: 'user_id', // Now works with unique constraint
      })
  
    if (error) {
      console.error('Save error:', error);
      alert('Error saving message: ' + error.message);
      return;
    }
    
    setMessage(newMessage);
    alert('Message saved successfully!');
  }
  return (
    <div className="space-y-4">
      {loading ? (
        <div>Loading secret message...</div>
      ) : (
        <>
          <div className="p-4 bg-gray-100 rounded">
            {message || "No secret message yet"}
          </div>
          {allowEdit && (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your secret message"
            />
          )}
          {allowEdit && (
            <button
              onClick={() => handleSave(message)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save Message
            </button>
          )}
        </>
      )}
    </div>
  )
}