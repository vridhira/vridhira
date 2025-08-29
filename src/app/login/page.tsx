'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome, Github } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-3xl tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="pt-2">
              Sign in to continue to your VRIDHIRA account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 pt-2">
              <Button className="w-full h-11 text-sm font-medium" onClick={() => signIn('github')}>
                <Github className="mr-2 h-5 w-5" /> Continue with GitHub
              </Button>
              <Button variant="outline" className="w-full h-11 text-sm font-medium" onClick={() => signIn('google')}>
                <Chrome className="mr-2 h-5 w-5" /> Continue with Google
              </Button>
            </div>
             <div className="mt-4 text-center text-sm">
                    Don't have an account?{" "}
                    <Link href="/signup" className="underline">
                        Sign up
                    </Link>
                </div>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-gray-500">
          By continuing, you agree to VRIDHIRA's <Link href="/terms" className="font-medium text-primary hover:underline">Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
