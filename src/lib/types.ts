
import { Product } from "./data";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber?: string | null;
  password?: string; // Can be optional for Google Sign-In
  image?: string;
  name?: string;
  createdAt?: string;
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
