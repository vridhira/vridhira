'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"


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
      <header className="mb-10">
        <h1 className="text-4xl font-headline tracking-tight">My Account</h1>
        <p className="text-muted-foreground mt-2">Manage your account, orders, and settings.</p>
      </header>
      <div className="grid gap-10 md:grid-cols-[280px_1fr]">
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center space-x-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                    <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="text-xl font-semibold">{user?.name}</CardTitle>
                    <CardDescription>Member since {memberSince}</CardDescription>
                </div>
                </CardHeader>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label>Email Address</Label>
                        <p className='text-sm text-muted-foreground'>{user?.email}</p>
                    </div>
                     <div className="space-y-1">
                        <Label>Password</Label>
                        <Button variant="outline" size="sm" disabled>Change Password</Button>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" disabled>Delete Account</Button>
                </CardContent>
            </Card>
        </div>

        <div className="w-full">
            <Tabs defaultValue="orders">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="orders">My Orders</TabsTrigger>
                    <TabsTrigger value="addresses">Address Book</TabsTrigger>
                    <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                    <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>A list of your past and current orders.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                        You have no orders.
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="addresses" className="mt-6">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Address Book</CardTitle>
                                <CardDescription>Manage your saved shipping addresses.</CardDescription>
                            </div>
                            <Button disabled>Add New Address</Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-10">You have no saved addresses.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="wishlist" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>My Wishlist</CardTitle>
                            <CardDescription>Products you have saved for later.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <p className="text-sm text-muted-foreground text-center py-10">Your wishlist is empty.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                 <TabsContent value="reviews" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>My Reviews</CardTitle>
                            <CardDescription>Product reviews you have submitted.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground text-center py-10">You have not submitted any reviews.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>
        </div>
      </div>
    </div>
  );
}
