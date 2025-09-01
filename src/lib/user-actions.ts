
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
    // In a real app, you might want to throw a more specific error or handle it differently
    throw new Error("Could not read user data.");
  }
};

const writeUsers = (users: User[]) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data.");
  }
};

export const findUserByEmail = async (email: string): Promise<User | undefined> => {
  if (!email) return undefined;
  const users = readUsers();
  return users.find((user) => user.email === email);
};

export const findUserByPhoneNumber = async (phoneNumber: string): Promise<User | undefined> => {
    if (!phoneNumber) return undefined;
    const users = readUsers();
    return users.find((user) => user.phoneNumber === phoneNumber);
}

export const createUser = async (userData: Partial<User>): Promise<User> => {

  const users = readUsers();
  
  if (userData.email) {
    const existingByEmail = users.find(u => u.email === userData.email);
    if(existingByEmail) {
        throw new Error('User with this email already exists.');
    }
  }

  if (userData.phoneNumber) {
    const existingByPhone = users.find(u => u.phoneNumber === userData.phoneNumber);
    if(existingByPhone) {
        throw new Error('User with this phone number already exists.');
    }
  }
  
  if (!userData.firstName || !userData.lastName) {
    // For social sign-ins, we might not have these immediately.
    // We can derive them from `name` if available.
    if (userData.name) {
      const nameParts = userData.name.split(' ');
      userData.firstName = nameParts[0];
      userData.lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Handle single names
    } else {
      throw new Error('First name and last name are required.');
    }
  }

  let hashedPassword = userData.password;
  if (userData.password && userData.password.length > 0) {
      hashedPassword = await bcrypt.hash(userData.password, 10);
  }

  const newUser: User = {
    id: userData.id || Date.now().toString(),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    password: hashedPassword,
    image: userData.image,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateUserPassword = async (phoneNumber: string, newPassword: string): Promise<void> => {
    const users = readUsers();
    const userIndex = users.findIndex(u => u.phoneNumber === phoneNumber);

    if (userIndex === -1) {
        throw new Error("User not found.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    users[userIndex].password = hashedPassword;

    writeUsers(users);
}

export const deleteUser = async (userId: string): Promise<{ success: boolean }> => {
    const users = readUsers();
    const filteredUsers = users.filter(u => u.id !== userId);

    if (users.length === filteredUsers.length) {
        // This prevents crashing if a user tries to delete an already deleted account.
        console.warn(`Attempted to delete non-existent user with ID: ${userId}`);
        return { success: true }; 
    }

    writeUsers(filteredUsers);
    return { success: true };
}

export const findOrCreateUser = async (profile: Partial<User>): Promise<User> => {
  if (!profile.email) {
    throw new Error('Email is required for social sign-in.');
  }

  const existingUser = await findUserByEmail(profile.email);
  if (existingUser) {
    const { password, ...userWithoutPassword } = existingUser;
    return userWithoutPassword;
  }
  
  // User does not exist, create a new one.
  return await createUser(profile);
}
