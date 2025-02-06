// components/AuthButton.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AuthButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  const deleteAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("You must be logged in to delete your account.");
      return;
    }
  
    const response = await fetch('/api/deleteAccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: user.id }),
    });
  
    // Check if the response is empty before parsing
    if (!response.ok) {
      console.error("Error deleting account:", response.statusText);
      alert(`Failed to delete account: ${response.statusText}`);
      return;
    }
  
    try {
      const result = await response.json();
      alert(result.message);
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error parsing response:", error);
      alert("Failed to parse response.");
    }
  };
    
  

  return (
    <div>
    <button 
    onClick={deleteAccount} 
    className="bg-red-500 text-white p-2 rounded">
  Delete Account
</button>
    <button 
      onClick={handleSignOut}
      className="bg-red-500 text-white p-2 rounded">
      Sign Out
    </button>
    </div>
  )
}