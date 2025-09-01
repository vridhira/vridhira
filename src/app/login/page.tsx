
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Chrome, KeyRound, Phone } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const phoneSchema = z.object({
  phoneNumber: z.string().refine(isValidPhoneNumber, { message: "Invalid phone number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});


export default function LoginPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/account');
    }
  }, [status, router]);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });


  const onEmailSubmit = async (values: z.infer<typeof emailSchema>) => {
    const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
    });

    if (result?.error) {
        toast({ title: "Login Failed", description: "Invalid credentials. Please check your email and password.", variant: "destructive" });
    } else {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/');
    }
  };
  
  const onPhoneSubmit = async (values: z.infer<typeof phoneSchema>) => {
    const result = await signIn('credentials', {
        redirect: false,
        phoneNumber: values.phoneNumber,
        password: values.password,
    });

    if (result?.error) {
        toast({ title: "Login Failed", description: "Invalid credentials. Please check your phone number and password.", variant: "destructive" });
    } else {
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // The signIn function from next-auth/react handles the Google flow when called with the provider's id
      await signIn('google', { callbackUrl: '/' });
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      toast({ title: "Login Failed", description: "Could not sign in with Google. Please try again.", variant: "destructive" });
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-11 w-full" />
                        <div className="flex items-center">
                            <Skeleton className="h-px w-full" />
                            <span className="mx-2 text-muted-foreground text-xs">OR</span>
                             <Skeleton className="h-px w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-11 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }


  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="pt-2">
              Choose your preferred sign-in method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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

                <TabsContent value="email" className="pt-4">
                  <Form {...emailForm}>
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
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
                            <div className="flex justify-between">
                              <FormLabel>Password</FormLabel>
                              <Link href="/forgot-password" passHref>
                                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                  Forgot password?
                                </span>
                              </Link>
                            </div>
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

                <TabsContent value="phone" className="pt-4">
                  <Form {...phoneForm}>
                    <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                      {isClient && <FormField
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
                      />}
                      <FormField
                        control={phoneForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-between">
                              <FormLabel>Password</FormLabel>
                               <Link href="/forgot-password" passHref>
                                <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                                  Forgot password?
                                </span>
                              </Link>
                            </div>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full h-11" disabled={phoneForm.formState.isSubmitting}>
                          <Phone className="mr-2"/> Sign In with Phone
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              <div id="recaptcha-container" style={{display: 'none', marginTop: '1rem'}}></div>
            </div>
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
