
'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
import { User, CreditCard, MapPin, Heart, Star, LogOut, Shield } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type AccountSection = 'profile' | 'orders' | 'addresses' | 'payment' | 'wishlist' | 'reviews' | 'security';

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<AccountSection>('profile');

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

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p>Loading account...</p></div>;
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
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Manage your personal and authentication details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={user?.image || ''} alt={user?.name || 'User'} />
                      <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-semibold">{user?.name}</h2>
                        <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <p className='text-sm font-medium'>{user?.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <p className='text-sm text-muted-foreground'>{user?.email}</p>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Button variant="outline" size="sm" disabled>Change Password</Button>
                </div>
            </CardContent>
          </Card>
        );
      case 'orders':
        return (
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
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading your orders...</TableCell></TableRow>
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
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">You have no orders yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      case 'addresses':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Address Book</CardTitle>
                <CardDescription>Manage your saved shipping and billing addresses.</CardDescription>
              </div>
              <Button disabled>Add New Address</Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-16">You have no saved addresses.</p>
            </CardContent>
          </Card>
        );
        case 'security':
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                        <CardDescription>Manage your account security settings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isDeleting ? 'Deleting...' : 'Delete My Account'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting}>
                                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <p className="text-xs text-muted-foreground mt-2">
                           Permanently remove all of your data from our platform.
                        </p>
                    </CardContent>
                </Card>
            );
        case 'payment':
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Manage your saved payment options.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-16">You have no saved payment methods.</p>
                </CardContent>
            </Card>
        )
         case 'wishlist':
        return (
             <Card>
                <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>Products you have saved for later.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-16">Your wishlist is empty.</p>
                </CardContent>
            </Card>
        )
         case 'reviews':
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Reviews</CardTitle>
                    <CardDescription>Product reviews you have submitted.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-16">You have not submitted any reviews.</p>
                </CardContent>
            </Card>
        )
      default:
        return null;
    }
  };
  
  const NavButton = ({ section, label, icon }: { section: AccountSection; label: string; icon: React.ReactNode }) => (
    <Button
      variant={activeSection === section ? 'secondary' : 'ghost'}
      className="w-full justify-start gap-3"
      onClick={() => setActiveSection(section)}
    >
      {icon}
      {label}
    </Button>
  );

  return (
    <div className="bg-muted/40">
        <div className="container mx-auto py-12 px-4 md:px-6">
        <header className="mb-10">
            <h1 className="text-4xl font-headline tracking-tight">My Account</h1>
            <p className="text-muted-foreground mt-2">Manage your account, orders, and settings.</p>
        </header>
        <div className="grid gap-10 md:grid-cols-[280px_1fr]">
            <aside className="space-y-4">
                <h2 className="text-lg font-semibold px-4">Account Settings</h2>
                <div className="space-y-1">
                    <NavButton section="profile" label="Profile" icon={<User />} />
                    <NavButton section="orders" label="My Orders" icon={<Badge />} />
                    <NavButton section="addresses" label="Address Book" icon={<MapPin />} />
                    <NavButton section="payment" label="Payment Methods" icon={<CreditCard />} />
                </div>
                <Separator />
                 <h2 className="text-lg font-semibold px-4">My Activity</h2>
                 <div className="space-y-1">
                    <NavButton section="wishlist" label="Wishlist" icon={<Heart />} />
                    <NavButton section="reviews" label="My Reviews" icon={<Star />} />
                </div>
                <Separator />
                <div className="space-y-1">
                    <NavButton section="security" label="Security" icon={<Shield />} />
                    <Button variant="ghost" className="w-full justify-start gap-3" onClick={() => signOut({ callbackUrl: '/' })}>
                      <LogOut />
                      Log Out
                    </Button>
                </div>
            </aside>

            <main>
                {renderSection()}
            </main>
        </div>
        </div>
    </div>
  );
}
