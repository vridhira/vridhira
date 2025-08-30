'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signIn } from 'next-auth/react';
import { Chrome } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { User } from '@/lib/types';
import { createUser } from '@/lib/user-actions';

const MAX_RESEND_ATTEMPTS = 5;
const RESEND_COOLDOWN_HOURS = 24;

interface WindowWithRecaptcha extends Window {
  recaptchaVerifier?: RecaptchaVerifier;
}

declare const window: WindowWithRecaptcha;

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [verificationMethod, setVerificationMethod] = useState('email');

  const [formData, setFormData] = useState<Partial<User>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const blockedUntil = localStorage.getItem('resendBlockedUntil');
    if (blockedUntil && new Date().getTime() < parseInt(blockedUntil, 10)) {
      setIsBlocked(true);
    }

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {},
      });
    }
  }, []);

  const handleSendCode = async () => {
    if (isBlocked) {
      toast({ title: "Error", description: `You have exceeded the maximum number of resend attempts. Please try again in 24 hours.` });
      return;
    }
    if (!formData.phoneNumber) {
      toast({ title: "Error", description: "Please enter a phone number." });
      return;
    }
    setIsSendingCode(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, formData.phoneNumber, window.recaptchaVerifier!);
      setConfirmationResult(confirmation);
      setIsCodeSent(true);
      setResendAttempts((prev) => prev + 1);
      toast({ title: "Success", description: "Verification code sent to your phone." });
    } catch (error) {
      console.error("Error sending verification code:", error);
      toast({ title: "Error", description: "Failed to send verification code. Please try again." });
    } finally {
      setIsSendingCode(false);
      if (resendAttempts + 1 >= MAX_RESEND_ATTEMPTS) {
        const blockedUntil = new Date().getTime() + RESEND_COOLDOWN_HOURS * 60 * 60 * 1000;
        localStorage.setItem('resendBlockedUntil', blockedUntil.toString());
        setIsBlocked(true);
      }
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({ title: "Error", description: "Please enter the verification code." });
      return;
    }
    if (!confirmationResult) {
      toast({ title: "Error", description: "Please send a verification code first." });
      return;
    }
    setIsVerifying(true);
    try {
      await confirmationResult.confirm(verificationCode);
      setIsPhoneVerified(true);
      toast({ title: "Success", description: "Phone number verified successfully!" });
    } catch (error) {
      console.error("Error verifying code:", error);
      toast({ title: "Error", description: "Invalid verification code. Please try again." });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { firstName, lastName, email, password, phoneNumber } = formData;
    let userData: Partial<User> = { firstName, lastName };

    if (verificationMethod === 'email') {
        userData = { ...userData, email, password };
    } else {
        if (!isPhoneVerified) {
            toast({ title: "Error", description: "Please verify your phone number before creating an account." });
            setIsSubmitting(false);
            return;
        }
        userData = { ...userData, phoneNumber };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Account created successfully! Please sign in." });
        router.push('/login');
      } else {
        const data = await response.json();
        toast({ title: "Error", description: data.message || "An error occurred during registration." });
      }
    } catch (error) {
      console.error("Registration submission error:", error);
      toast({ title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData({ ...formData, phoneNumber: value });
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>Choose your sign up method</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" placeholder="Max" required value={formData.firstName} onChange={handleInputChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" placeholder="Robinson" required value={formData.lastName} onChange={handleInputChange} />
              </div>
            </div>

            <Tabs value={verificationMethod} onValueChange={setVerificationMethod} className='mt-4'>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <div className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required={verificationMethod === 'email'} value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required={verificationMethod === 'email'} value={formData.password} onChange={handleInputChange} />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="phone">
                <div className="grid gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <PhoneInput
                        placeholder="Enter phone number"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        defaultCountry="US"
                        international
                        countryCallingCodeEditable={false}
                        disabled={isPhoneVerified}
                      />
                      <Button type="button" variant="outline" onClick={handleSendCode} disabled={isSendingCode || isBlocked || isPhoneVerified}>
                        {isSendingCode ? "Sending..." : isCodeSent ? "Resend" : "Send Code"}
                      </Button>
                    </div>
                    {isCodeSent && !isBlocked && !isPhoneVerified && <p className='text-xs text-muted-foreground'>You have {MAX_RESEND_ATTEMPTS - resendAttempts} attempts remaining.</p>}
                    {isBlocked && <p className='text-xs text-destructive'>You have been blocked. Please try again after 24 hours.</p>}
                    {isPhoneVerified && <p className='text-xs text-green-600'>Your phone number has been verified.</p>}
                  </div>
                  {isCodeSent && !isPhoneVerified && (
                    <div className="grid gap-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <div className="flex gap-2">
                        <Input
                          id="verification-code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value)}
                        />
                        <Button type="button" onClick={handleVerifyCode} disabled={isVerifying}>
                          {isVerifying ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <div id="recaptcha-container"></div>
            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create an account'}
            </Button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl: '/' })}>
            <Chrome className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
