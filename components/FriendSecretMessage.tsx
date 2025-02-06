// components/FriendSecretMessage.tsx
'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';  // Assuming you've set up the supabase client
import SecretMessage from './SecretMessage';

interface FriendSecretMessageProps {
  currentUserId: string;
  friendId: string;
}

export default function FriendSecretMessage({ currentUserId, friendId }: FriendSecretMessageProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Not logged in.");
        setLoading(false);
        return;
      }

      console.log("Logged in user:", user);

      // Check if the user is the owner or is friends with the secret's owner
      try {
        // 1. First, check if the user is the owner of the secret.
        if (currentUserId === user.id) {
          setHasAccess(true);  // Allow access to own secret
          setLoading(false);
          return;
        }

        // 2. Check if the user is friends with the owner and if the friendship status is 'accepted'
        const { data, error: fetchError } = await supabase
          .from('friends')
          .select('status')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`)
          .eq('status', 'accepted')
          .single();

        console.log("Fetched data from friends table:", data);  // Log the fetched data for debugging

        if (fetchError || !data || data.status !== 'accepted') {
          setHasAccess(false);
          setError('You do not have access to this message.');
        } else {
          setHasAccess(true);
        }
      } catch (err) {
        console.log("Error during permission check:", err);
        setError('Error fetching permissions.');
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, [currentUserId, friendId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return hasAccess ? (
    <SecretMessage userId={friendId} allowEdit={false} />
  ) : (
    <div className="text-red-500">
      You don't have permission to view this secret!
    </div>
  );
}