'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Type-casting for email and password from the form data
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Sign up the user with Supabase Auth
  const { data: { user }, error: signupError } = await supabase.auth.signUp(data)

  if (signupError) {
    console.error("Sign Up Error:", signupError.message)  // Log error to console
    redirect('/error')
    return
  }

  // Manually insert the user data into the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: user?.id,            // User ID from Supabase Auth
      email: user?.email,      // User email from Supabase Auth
      inserted_at: new Date(), // Current timestamp
      updated_at: new Date(),  // Current timestamp
    })

  if (profileError) {
    console.error("Profile Insertion Error:", profileError.message)
    redirect('/error')
    return
  }

  // Revalidate the path for layout and redirect to confirmation page
  revalidatePath('/', 'layout')
  redirect('/signup-confirmation')
}