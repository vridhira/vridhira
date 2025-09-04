
'use server';

import { createUser } from '@/lib/user-actions';
import { createShop } from '@/lib/shop-actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        password,
        shopName,
        shopCategory
    } = body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !shopName || !shopCategory) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // 1. Create the user with the 'shopkeeper' role
    const user = await createUser({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role: 'shopkeeper', // Assign shopkeeper role directly
    });
    
    // 2. Create the shop and link it to the user
    await createShop({
        ownerId: user.id,
        shopName: shopName,
        category: shopCategory,
    });

    // Return the created user (without the password)
    return NextResponse.json(user, { status: 201 });

  } catch (error: any) {
    console.error("Vendor Signup API Error:", error);
    // Send back a specific error message if available (e.g., "User already exists")
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
