import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Click the button below to create your account and start shopping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
             <Link href="/api/auth/login?screen_hint=signup">
                <UserPlus className="mr-2" /> Sign Up
            </Link>
          </Button>
        </CardContent>
        <div className="p-6 pt-0 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/api/auth/login" className="underline hover:text-primary">
                Login
            </Link>
        </div>
      </Card>
    </div>
  );
}
