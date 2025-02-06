import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create an admin Supabase client using your service role key.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // Parse the JSON body from the request.
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required.' }, { status: 400 });
    }

    // Attempt to delete the user with admin privileges.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'User successfully deleted.' }, { status: 200 });
  } catch (err) {
    console.error('Error in deleteAccount API:', err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
