import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Click the button below to create your account and start shopping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/api/auth/login">Sign Up</Link>
          </Button>
        </CardContent>
        <div className="p-6 pt-0 text-center text-sm">
            Already have an account?{" "}
            <Link href="/api/auth/login" className="underline">
                Login
            </Link>
        </div>
      </Card>
    </div>
  );
}
