

'use server';

import { createUser } from '@/lib/user-actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phoneNumber, password } = body;

    // Email and password are now the primary requirements
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    const user = await createUser({
      firstName,
      lastName,
      email,
      phoneNumber, // This can be undefined or null
      password,
    });
    
    // TODO: Send verification email here

    // Return the created user (without the password)
    return NextResponse.json(user, { status: 201 });

  } catch (error: any) {
    console.error("Signup API Error:", error);
    // Send back a specific error message if available (e.g., "User already exists")
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
