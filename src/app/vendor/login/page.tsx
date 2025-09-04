
'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function VendorLoginPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      // Redirect to a future vendor dashboard
      router.push('/dashboard'); 
    }
  }, [status, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
      });

      if (result?.error) {
          toast({ title: "Login Failed", description: "Invalid credentials. Please check your email and password.", variant: "destructive" });
      } else if (result?.ok) {
          toast({ title: "Login Successful", description: "Welcome back, seller!" });
          router.push('/dashboard'); // Will be vendor dashboard later
      }
    } catch (error) {
        toast({ title: "Login Failed", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
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
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
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
            <CardTitle className="font-headline text-3xl tracking-tight">Seller Portal</CardTitle>
            <CardDescription className="pt-2">
              Log in to manage your shop and products.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
                    <KeyRound className="mr-2"/> Sign In
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Don't have a seller account?{" "}
              <Link href="/vendor/signup" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
