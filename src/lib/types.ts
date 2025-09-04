

import { Product } from "./data";

export type UserRole = 'user' | 'shopkeeper' | 'admin' | 'owner';

export interface Address {
  id: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
    id: string;
    cardType: string;
    last4: string;
    expiryDate: string;
    isDefault?: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName:string;
  email: string | null;
  phoneNumber?: string | null;
  password?: string; // Can be optional for Google Sign-In
  image?: string;
  name?: string;
  createdAt?: string;
  role: UserRole;
  isVerified: boolean; // Added for email verification
  addresses?: Address[];
  paymentMethods?: PaymentMethod[];
}

export interface Shop {
  id: string;
  ownerId: string; // Links to the User ID
  name: string;
  category: string;
  createdAt: string;
}


export interface OtpAttempt {
    phoneNumber: string;
    count: number;
    firstAttemptTimestamp: number;
    bannedUntil?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
    id: string;
    productId: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
}
