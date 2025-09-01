
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from '@/context/AuthContext';
import { findUserByPhoneNumber, findUserByEmail, updateUserPassword } from '@/lib/user-actions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const phoneSchema = z.object({
    phoneNumber: z.string().refine(isValidPhoneNumber, { message: "Invalid phone number." }),
});

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const otpSchema = z.object({
    otp: z.string().min(6, { message: "OTP must be 6 digits." }),
});

const passwordSchema = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
});


type Step = 'phone' | 'otp' | 'password';

export default function ForgotPasswordPage() {
    const { signInWithPhoneNumber, confirmPhoneNumberOtp, sendPasswordResetEmail } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [step, setStep] = useState<Step>('phone');
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("phone");

    const phoneForm = useForm<z.infer<typeof phoneSchema>>({
        resolver: zodResolver(phoneSchema),
        defaultValues: { phoneNumber: "" },
    });

     const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });
    
    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const handlePhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
        setIsSubmitting(true);
        try {
            const userExists = await findUserByPhoneNumber(values.phoneNumber);
            if (!userExists) {
                toast({ title: "Error", description: "No account found with this phone number.", variant: "destructive" });
                return;
            }

            const recaptchaContainerId = 'recaptcha-container';
            const result = await signInWithPhoneNumber(values.phoneNumber, recaptchaContainerId);
            
            if (result && result.verificationId) {
                setVerificationId(result.verificationId);
                setVerifiedPhoneNumber(values.phoneNumber);
                setStep('otp');
                toast({ title: "OTP Sent", description: "Please check your phone for the verification code." });
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleOtpSubmit = async (values: z.infer<typeof otpSchema>) => {
        if (!verificationId) {
            toast({ title: "Error", description: "Verification session expired. Please try again.", variant: "destructive"});
            setStep('phone');
            return;
        }
        setIsSubmitting(true);
        try {
            await confirmPhoneNumberOtp(verificationId, values.otp);
            setStep('password');
            toast({ title: "Verification Successful", description: "You can now reset your password." });
        } catch (error: any) {
             toast({ title: "Verification Failed", description: error.message, variant: "destructive"});
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handlePasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
        if (!verifiedPhoneNumber) {
             toast({ title: "Error", description: "Something went wrong. Please start over.", variant: "destructive"});
             setStep('phone');
             return;
        }
         setIsSubmitting(true);
         try {
            await updateUserPassword(verifiedPhoneNumber, values.password);
            toast({ title: "Password Reset Successful", description: "You can now log in with your new password." });
            router.push('/login');
         } catch(error: any) {
             toast({ title: "Error", description: error.message, variant: "destructive"});
         } finally {
            setIsSubmitting(false);
         }
    };

    const handleEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
        setIsSubmitting(true);
        try {
            const userExists = await findUserByEmail(values.email);
            if (!userExists) {
                toast({ title: "Error", description: "No account found with this email address.", variant: "destructive" });
                return;
            }

            await sendPasswordResetEmail(values.email);
            toast({
                title: "Password Reset Email Sent",
                description: "Check your inbox for a link to reset your password.",
            });
            emailForm.reset();

        } catch (error: any) {
             toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };


  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-3xl tracking-tight text-center">Reset Your Password</CardTitle>
            <CardDescription className="pt-2 text-center">
              {activeTab === 'phone' && step === 'phone' && 'Enter your phone number to receive a verification code.'}
              {activeTab === 'phone' && step === 'otp' && `Enter the 6-digit code sent to ${verifiedPhoneNumber}.`}
              {activeTab === 'phone' && step === 'password' && 'Create a new, strong password.'}
              {activeTab === 'email' && 'Enter your email to receive a password reset link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phone" onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="phone">Phone Number</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                <TabsContent value="phone" className="pt-4">
                    {step === 'phone' && (
                        <Form {...phoneForm}>
                        <form onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)} className="space-y-4">
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
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>Send Verification Code</Button>
                        </form>
                        </Form>
                    )}

                    {step === 'otp' && (
                        <Form {...otpForm}>
                        <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)} className="space-y-4">
                            <FormField
                            control={otpForm.control}
                            name="otp"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Verification Code</FormLabel>
                                <FormControl><Input placeholder="123456" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>Verify Code</Button>
                        </form>
                        </Form>
                    )}

                    {step === 'password' && (
                        <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                            <FormField
                            control={passwordForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>Reset Password</Button>
                        </form>
                        </Form>
                    )}
                </TabsContent>
                 <TabsContent value="email" className="pt-4">
                    <Form {...emailForm}>
                      <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                        <FormField
                            control={emailForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={isSubmitting}>Send Reset Link</Button>
                      </form>
                    </Form>
                </TabsContent>
            </Tabs>
             <div id="recaptcha-container" style={{display: 'none', marginTop: '1rem'}}></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
