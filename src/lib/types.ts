import { Product } from "./data";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  password?: string; // Added password field
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
