export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  password?: string; // This will be the hashed password
  phoneNumber?: string;
}
