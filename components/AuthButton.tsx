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
  
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    
    if (error) {
      console.error("Error deleting account:", error);
      alert(`Failed to delete account: ${error.message}`);
      return;
    }
  
    alert("Account successfully deleted.");
    window.location.href = "/"; // Redirect to home page
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