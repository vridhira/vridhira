
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/lib/data';

const baseCategories = categories.map(c => c.name);

const signupSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().refine(isValidPhoneNumber, { message: "Invalid phone number." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  shopName: z.string().min(3, { message: "Shop name must be at least 3 characters." }),
  shopCategory: z.string({ required_error: "Please select a shop category." }),
});

export default function VendorSignupPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      shopName: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      const signupResponse = await fetch('/api/auth/vendor-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.json();
        throw new Error(errorData.message || "An unknown error occurred during signup.");
      }

      toast({
        title: "Seller Account Created!",
        description: "Welcome to the VRIDHIRA marketplace! You can now log in.",
      });

       const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
      });

       if (result?.error) {
        toast({ title: "Login Failed", description: "Automatic login failed, please try logging in manually.", variant: "destructive" });
        router.push('/vendor/login');
      } else {
        router.push('/dashboard'); // Will be vendor dashboard
      }

    } catch (error: any) {
      toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
      });
    }
  };
  
  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-lg space-y-8">
                 <Card>
                    <CardHeader className="text-center">
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
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
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl tracking-tight">Become a VRIDHIRA Seller</CardTitle>
            <CardDescription className="pt-2">
              Create your account and start your own shop on our marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your First Name</FormLabel>
                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Last Name</FormLabel>
                        <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                            <FormLabel>Password</FormLabel>
                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                
                {isClient && <FormField
                    control={form.control}
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

                <div className="border-t pt-4 space-y-4">
                    <FormField
                        control={form.control}
                        name="shopName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Shop Name</FormLabel>
                            <FormControl><Input placeholder="e.g., Jaipur Blue Pottery" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                        control={form.control}
                        name="shopCategory"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Shop Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category for your shop" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {baseCategories.map(category => (
                                        <SelectItem key={category} value={category}>{category}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                <Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
                  <UserPlus className="mr-2"/> Create Seller Account
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              Already a seller?{" "}
              <Link href="/vendor/login" className="underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
