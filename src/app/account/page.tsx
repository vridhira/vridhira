
'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOrdersByUserId, Order } from '@/lib/data';
import { useEffect, useState } from 'react';
import { deleteUser } from '@/lib/user-actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


export default function AccountPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      getOrdersByUserId(session.user.id).then(userOrders => {
        setOrders(userOrders);
        setIsLoadingOrders(false);
      });
    } else if (status === 'unauthenticated') {
      redirect('/login');
    } else if (status !== 'loading') {
        setIsLoadingOrders(false);
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p>Loading...</p></div>;
  }

  const user = session?.user;
  const memberSince = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available';

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Could not delete your account. Please try again later.",
        variant: "destructive",
      });
    } finally {
        setIsDeleting(false);
    }
  };


  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
        case 'Delivered': return 'default';
        case 'Shipped': return 'secondary';
        case 'Processing': return 'outline';
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
  }

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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <Button variant="destructive" disabled={isDeleting}>Delete Account</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            account and remove your data from our servers.
                          </Description>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                                        <TableHead className="text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingOrders ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Loading your orders...</TableCell>
                                        </TableRow>
                                    ) : orders.length > 0 ? (
                                        orders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                                                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                                <TableCell><Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge></TableCell>
                                                <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                                                <TableCell className="text-right"><Button variant="outline" size="sm" disabled>View Details</Button></TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">You have no orders yet.</TableCell>
                                        </TableRow>
                                    )}
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
                            <CardTitle>My Reviews</CardTitle>                            <CardDescription>Product reviews you have submitted.</CardDescription>
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
