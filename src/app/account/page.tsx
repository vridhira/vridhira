'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p>Loading...</p></div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // User is authenticated
  const user = session?.user;
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available';

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl font-headline">{user?.name}</CardTitle>
              <CardDescription>Member since {memberSince}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" disabled>Edit Profile</Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>This is your primary account information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input defaultValue={user?.name || ''} disabled />
                </div>
                <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue={user?.email || ''} disabled />
                    <p className='text-xs text-muted-foreground'>Your email is used for login and is not editable.</p>
                </div>
            </CardContent>
          </Card>
          
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button disabled>Change Password</Button>
                <Button variant="destructive" disabled>Delete Account</Button>
            </CardContent>
          </Card>

          {/* Buyer-Specific Sections (Placeholders) */}
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>View your order history and track current orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">You have no recent orders.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
