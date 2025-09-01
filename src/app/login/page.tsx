'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-number-input/react-hook-form-input';
import 'react-phone-number-input/style.css';
import { Chrome, KeyRound, Phone, Mail } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { getOtpAttemptInfo } from '@/lib/otp-actions';
import { isValidPhoneNumber } from 'react-phone-number-input';


const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const phoneSchema = z.object({
  phoneNumber: z.string().refine(isValidPhoneNumber, { message: "Invalid phone number." }),
  otp: z.string().optional(),
});


export default function LoginPage() {
  const { signInWithGoogle, signInWithPhoneNumber, confirmPhoneNumberOtp } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  
  // OTP Rate Limiting State
  const [otpAttemptsRemaining, setOtpAttemptsRemaining] = useState(5);
  const [isBanned, setIsBanned] = useState(false);
  const [banExpires, setBanExpires] = useState<number | null>(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const phoneNumberValue = phoneForm.watch('phoneNumber');

  useEffect(() => {
    const checkPhoneStatus = async () => {
        if (phoneNumberValue && isValidPhoneNumber(phoneNumberValue)) {
            setIsCheckingPhone(true);
            try {
                const { remaining, bannedUntil } = await getOtpAttemptInfo(phoneNumberValue);
                setOtpAttemptsRemaining(remaining);
                if (bannedUntil && bannedUntil > Date.now()) {
                    setIsBanned(true);
                    setBanExpires(bannedUntil);
                } else {
                    setIsBanned(false);
                    setBanExpires(null);
                }
            } catch (error) {
                console.error("Failed to check phone status", error);
            } finally {
                setIsCheckingPhone(false);
            }
        }
    };
    const debounceTimeout = setTimeout(checkPhoneStatus, 500);
    return () => clearTimeout(debounceTimeout);
  }, [phoneNumberValue]);

  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
    });

    if (result?.error) {
        toast({ title: "Login Failed", description: result.error, variant: "destructive" });
    } else {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/account');
    }
  };
  
  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    if (isBanned) {
      toast({ title: "Request blocked", description: "This phone number is temporarily blocked due to too many requests.", variant: "destructive" });
      return;
    }
  
    if (!isOtpSent) {
      try {
        const recaptchaContainerId = 'recaptcha-container';
        const recaptchaContainer = document.getElementById(recaptchaContainerId);
        if (recaptchaContainer) {
            recaptchaContainer.style.display = 'block';
        }
        
        const result = await signInWithPhoneNumber(values.phoneNumber, recaptchaContainerId);
        
        if (result && result.verificationId) {
            setVerificationId(result.verificationId);
            setOtpAttemptsRemaining(result.remaining);
            setIsOtpSent(true);
            toast({ title: "OTP Sent", description: "Please check your phone for the verification code." });
        }
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        if (error.bannedUntil) {
            setIsBanned(true);
            setBanExpires(error.bannedUntil);
        }
      }
    } else {
      if (verificationId && values.otp) {
        try {
          await confirmPhoneNumberOtp(verificationId, values.otp);
          toast({ title: "Login Successful", description: "Welcome back!" });
          router.push('/account');
        } catch (error: any) {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        }
      } else {
         toast({ title: "Error", description: "OTP is required.", variant: "destructive" });
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/account');
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  const getBanTimeRemaining = () => {
    if (!banExpires) return '';
    const minutesRemaining = Math.ceil((banExpires - Date.now()) / (1000 * 60));
    const hoursRemaining = Math.floor(minutesRemaining / 60);
    const mins = minutesRemaining % 60;
    if (hoursRemaining > 0) {
        return `Please try again in ${hoursRemaining}h ${mins}m.`;
    }
    return `Please try again in ${minutesRemaining} minutes.`;
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="pt-2">
              Choose your preferred sign-in method.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full h-11 text-sm font-medium" onClick={handleGoogleSignIn}>
              <Chrome className="mr-2 h-5 w-5" /> Continue with Google
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>

              <TabsContent value="email">
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4 pt-4">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full h-11" disabled={emailForm.formState.isSubmitting}>
                        <KeyRound className="mr-2"/> Sign In with Email
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="phone">
                <Form {...phoneForm}>
                  <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4 pt-4">
                    <FormField
                        control={phoneForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        international
                                        defaultCountry="US"
                                        placeholder="Enter phone number"
                                        {...field}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        disabled={isBanned || isCheckingPhone}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     {isBanned ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm font-medium text-destructive">
                                Too many attempts. {getBanTimeRemaining()}
                            </p>
                            <Button asChild variant="outline" className="w-full">
                                <a href="mailto:support@vridhira.com"><Mail className="mr-2"/>Contact Support</a>
                            </Button>
                        </div>
                     ) : (
                        <>
                            {!isOtpSent && otpAttemptsRemaining < 5 && (
                                <p className="text-sm text-center text-yellow-600">
                                    You have {otpAttemptsRemaining} attempts remaining today.
                                </p>
                            )}
                            {isOtpSent && (
                            <FormField
                                control={phoneForm.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Verification Code (OTP)</FormLabel>
                                    <FormControl><Input placeholder="123456" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            )}
                            <Button type="submit" className="w-full h-11" disabled={phoneForm.formState.isSubmitting || isBanned || isCheckingPhone}>
                                <Phone className="mr-2"/>{isOtpSent ? 'Verify & Sign In' : 'Send OTP'}
                            </Button>
                        </>
                     )}
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            <div id="recaptcha-container" style={{display: 'none'}}></div>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
