'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AccountPage() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div className="container mx-auto py-16 md:py-24">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
                <AvatarImage src={user.picture ?? ''} alt={user.name ?? 'User'} />
                <AvatarFallback>
                  {user.name?.charAt(0).toUpperCase() || <User />}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
               <p className="text-muted-foreground mb-6">Welcome to your account page.</p>
              <Button asChild variant="destructive">
                <Link href="/api/auth/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 md:py-24 text-center">
      <User className="mx-auto h-16 w-16 text-muted-foreground" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Access Denied</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        You must be logged in to view this page.
      </p>
      <Button asChild className="mt-6">
        <Link href="/api/auth/login">Login</Link>
      </Button>
    </div>
  );
}
