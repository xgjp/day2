'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthLoader({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) return <div>Checking authentication...</div>

  return <>{children}</>
}