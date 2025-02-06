'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/supabaseClient';

export default function SecretPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Secret Page</h1>
      <p>Welcome, {user.email}</p>
    </div>
  );
}
