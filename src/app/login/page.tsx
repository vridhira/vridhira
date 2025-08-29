import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Login or Sign Up</CardTitle>
          <CardDescription>
            Use your preferred method to sign in to your account. We support password, OTP, and social logins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/api/auth/login">
              <LogIn className="mr-2" /> Continue
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
