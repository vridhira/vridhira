'use server';

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { User } from './types';

// --- DEVELOPMENT ONLY --- //
// This is a simple file-based user store for development purposes.
// It is not suitable for production. A proper database should be used instead.

const usersFilePath = path.join(process.cwd(), 'src', 'lib', 'users.json');

const readUsers = (): User[] => {
  try {
    if (!fs.existsSync(usersFilePath)) {
      fs.writeFileSync(usersFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
};

const writeUsers = (users: User[]) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
  }
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  if (!email) return undefined;
  const users = readUsers();
  return users.find((user) => user.email === email);
};

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | undefined> => {
    const users = readUsers();
    return users.find((user) => user.phoneNumber === phoneNumber);
}

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const users = readUsers();
  if (!userData.email || !userData.firstName || !userData.lastName) {
    throw new Error('First name, last name and email are required to create a user.');
  }

  if(userData.email) {
      const existing = await findUserByEmail(userData.email);
      if(existing) {
          throw new Error('User with this email already exists.');
      }
  }

  let hashedPassword = userData.password;
  if (userData.password) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
  }

  const newUser: User = {
    id: userData.id || Date.now().toString(),
    ...userData,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    password: hashedPassword
  };
  users.push(newUser);
  writeUsers(users);
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};
