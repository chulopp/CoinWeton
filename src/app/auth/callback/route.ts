import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  
  if (code) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { error, data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session) {
      try {
        const userId = session.user.id;
        const userEmail = session.user.email;
        
        if (userEmail) {
          // Check if user exists
          const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          
          if (existingUser.length === 0) {
            try {
              await db.insert(users).values({
                id: userId,
                email: userEmail,
              });
              console.log(`Successfully synced new user: ${userEmail}`);
            } catch (e) {
              console.error('INSERT_ERROR:', e);
            }
          } else {
            console.log(`User already exists: ${userEmail}`);
          }
        }
      } catch (dbError) {
        console.error("Error syncing user to database:", dbError);
      }
      
      // Redirect to home page with success param
      return NextResponse.redirect(`${origin}/?auth=success`);
    }

    console.error('AUTH_EXCHANGE_ERROR:', error);
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/?error=auth_callback_failed`);
}
