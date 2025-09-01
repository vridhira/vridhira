'use server';

import fs from 'fs';
import path from 'path';
import { OtpAttempt } from './types';

const otpAttemptsFilePath = path.join(process.cwd(), 'src', 'lib', 'otp-attempts.json');
const OTP_LIMIT = 5;
const BAN_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const readOtpAttempts = (): OtpAttempt[] => {
  try {
    if (!fs.existsSync(otpAttemptsFilePath)) {
      fs.writeFileSync(otpAttemptsFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(otpAttemptsFilePath, 'utf8');
    return JSON.parse(data) as OtpAttempt[];
  } catch (error) {
    console.error("Error reading OTP attempts file:", error);
    return [];
  }
};

const writeOtpAttempts = (attempts: OtpAttempt[]) => {
  try {
    fs.writeFileSync(otpAttemptsFilePath, JSON.stringify(attempts, null, 2));
  } catch (error) {
    console.error("Error writing OTP attempts file:", error);
  }
};

export const checkAndRecordOtpAttempt = async (phoneNumber: string): Promise<{ success: boolean; message: string; remaining: number; bannedUntil?: number }> => {
  const attempts = readOtpAttempts();
  let attempt = attempts.find(a => a.phoneNumber === phoneNumber);
  const now = Date.now();

  if (attempt && attempt.bannedUntil && now < attempt.bannedUntil) {
    return { success: false, message: 'This phone number is temporarily banned.', remaining: 0, bannedUntil: attempt.bannedUntil };
  }

  if (!attempt) {
    attempt = { phoneNumber, count: 0, firstAttemptTimestamp: now };
    attempts.push(attempt);
  }

  // Reset count if it's a new day (24 hours since first attempt)
  if (now - attempt.firstAttemptTimestamp > BAN_DURATION_MS) {
    attempt.count = 0;
    attempt.firstAttemptTimestamp = now;
    attempt.bannedUntil = undefined;
  }

  if (attempt.count >= OTP_LIMIT) {
    attempt.bannedUntil = now + BAN_DURATION_MS;
    writeOtpAttempts(attempts);
    return { success: false, message: 'OTP limit exceeded. Please try again after 24 hours.', remaining: 0, bannedUntil: attempt.bannedUntil };
  }

  attempt.count++;
  writeOtpAttempts(attempts);
  
  const remaining = OTP_LIMIT - attempt.count;
  return { success: true, message: 'OTP can be sent.', remaining };
};

export const getOtpAttemptInfo = async (phoneNumber: string): Promise<{ remaining: number; bannedUntil?: number }> => {
    const attempts = readOtpAttempts();
    const attempt = attempts.find(a => a.phoneNumber === phoneNumber);
    const now = Date.now();

    if (!attempt) {
        return { remaining: OTP_LIMIT, bannedUntil: undefined };
    }

    if (attempt.bannedUntil && now < attempt.bannedUntil) {
        return { remaining: 0, bannedUntil: attempt.bannedUntil };
    }

    if (now - attempt.firstAttemptTimestamp > BAN_DURATION_MS) {
        return { remaining: OTP_LIMIT, bannedUntil: undefined };
    }
    
    return { remaining: OTP_LIMIT - attempt.count, bannedUntil: undefined };
}
