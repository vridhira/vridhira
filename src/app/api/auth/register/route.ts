'use server';

import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, findUserByPhoneNumber } from '@/lib/data';
import { User } from '@/lib/types';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, phoneNumber } = body;

    if (!firstName || !lastName) {
      return NextResponse.json({ message: 'First name and last name are required.' }, { status: 400 });
    }

    if (email && password) {
      if (findUserByEmail(email)) {
        return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser: Partial<User> = { email, password: hashedPassword, firstName, lastName };
      createUser(newUser);
    } else if (phoneNumber) {
        if (findUserByPhoneNumber(phoneNumber)) {
            return NextResponse.json({ message: 'User with this phone number already exists.' }, { status: 409 });
        }
        const newUser: Partial<User> = { phoneNumber, firstName, lastName };
        createUser(newUser);
    } else {
      return NextResponse.json({ message: 'Either email/password or phone number is required.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'User created successfully!' }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: 'An error occurred during registration.', error: errorMessage }, { status: 500 });
  }
}
