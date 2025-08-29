'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login or Sign Up</CardTitle>
          <CardDescription>
            Click the button below to sign in with your GitHub account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => signIn('github')}>
            <LogIn className="mr-2" /> Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
