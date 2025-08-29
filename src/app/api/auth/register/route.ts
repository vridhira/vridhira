'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phoneNumber } = body;

    // --- DATABASE LOGIC WOULD GO HERE ---
    // For now, we'll just log the data to the console to simulate user creation.
    
    if (email) {
      console.log("Creating user with email:", { email, firstName, lastName });
      // Example: await db.user.create({ data: { email, password, firstName, lastName } });
    } else if (phoneNumber) {
      console.log("Creating user with phone:", { phoneNumber, firstName, lastName });
      // Example: await db.user.create({ data: { phoneNumber, firstName, lastName } });
    } else {
      return NextResponse.json({ message: 'Either email or phone number is required.' }, { status: 400 });
    }

    // In a real app, you'd also handle password hashing here before saving to the DB.

    console.log("Received user data:", body);
    // --- END OF DATABASE LOGIC ---

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: 'An error occurred during registration.' }, { status: 500 });
  }
}
