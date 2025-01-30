// actions.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

// Explicit server action declaration
export const login = async (formData: FormData) => {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/private')
}

export const signup = async (formData: FormData) => {
  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    }
    
  })

// In actions.ts signup function
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  console.error('Missing NEXT_PUBLIC_SITE_URL environment variable')
  redirect('/error?message=Missing+configuration')
}

// Add email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(data.email)) {
  redirect('/error?message=Invalid+email+format')
}

// Add password validation
if (data.password.length < 6) {
  redirect('/error?message=Password+must+be+at+least+6+characters')
}

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`)
  }

  redirect('/signup-confirmation')
}