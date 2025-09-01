import { Product } from "./data";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string; // Can be optional for Google Sign-In
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
