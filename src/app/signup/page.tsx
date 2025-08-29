'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Click the button below to sign up with your GitHub account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => signIn('github')}>
            <UserPlus className="mr-2" /> Sign Up with GitHub
          </Button>
        </CardContent>
        <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => signIn('github')} className="underline hover:text-primary">
                Login
            </button>
        </div>
      </Card>
    </div>
  );
}
