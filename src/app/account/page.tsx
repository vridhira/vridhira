
'use client';

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getOrdersByUserId, Order, reviews as allReviews, products as allProducts } from '@/lib/data';
import { useEffect, useState } from 'react';
import { deleteUser, updateUserAddresses, updateUserPayments, updateUserPassword } from '@/lib/user-actions';
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
import { User, CreditCard, MapPin, Heart, Star, LogOut, Shield, Trash2, Edit, PlusCircle, Home } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Address, PaymentMethod, Review, User as AppUser } from '@/lib/types';
import { AddressDialog } from '@/components/AddressDialog';
import { PaymentDialog } from '@/components/PaymentDialog';
import { PasswordDialog } from '@/components/PasswordDialog';
import { useWishlist } from '@/context/WishlistContext';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';


type AccountSection = 'profile' | 'orders' | 'addresses' | 'payment' | 'wishlist' | 'reviews' | 'security';

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const { toast } = useToast();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSection, setActiveSection] = useState<AccountSection>('profile');

  // Dialog states
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      const user = session.user as AppUser;
      getOrdersByUserId(user.id).then(userOrders => {
        setOrders(userOrders);
      });
      setUserReviews(allReviews.filter(r => r.author.toLowerCase() === user.name?.toLowerCase()));
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      redirect('/login');
    } else if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [session, status]);

  if (status === 'loading' || !session) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]"><p>Loading account...</p></div>;
  }
  
  const user = session?.user as AppUser;
  const addresses = user.addresses || [];
  const payments = user.paymentMethods || [];
  
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

  const handleSaveAddress = async (address: Address) => {
    const newAddresses = address.id
      ? addresses.map(a => a.id === address.id ? address : a)
      : [...addresses, { ...address, id: `addr_${Date.now()}` }];
    
    if (address.isDefault) {
      newAddresses.forEach(a => { if (a.id !== address.id) a.isDefault = false; });
    }

    const result = await updateUserAddresses(user.id, newAddresses);
    if(result.success) {
        await update({ ...session, user: { ...user, addresses: newAddresses } });
        toast({ title: 'Success', description: 'Address has been saved.' });
        setIsAddressDialogOpen(false);
        setEditingAddress(null);
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const newAddresses = addresses.filter(a => a.id !== addressId);
    const result = await updateUserAddresses(user.id, newAddresses);
     if(result.success) {
        await update({ ...session, user: { ...user, addresses: newAddresses } });
        toast({ title: 'Success', description: 'Address has been deleted.' });
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };
  
   const handleSavePayment = async (payment: PaymentMethod) => {
    const newPayments = payment.id
      ? payments.map(p => (p.id === payment.id ? payment : p))
      : [...payments, { ...payment, id: `pay_${Date.now()}` }];
    
     if (payment.isDefault) {
      newPayments.forEach(p => { if (p.id !== payment.id) p.isDefault = false; });
    }
      
    const result = await updateUserPayments(user.id, newPayments);
    if(result.success) {
        await update({ ...session, user: { ...user, paymentMethods: newPayments } });
        toast({ title: 'Success', description: 'Payment method has been saved.' });
        setIsPaymentDialogOpen(false);
        setEditingPayment(null);
    } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    const newPayments = payments.filter(p => p.id !== paymentId);
    const result = await updateUserPayments(user.id, newPayments);
    if (result.success) {
      await update({ ...session, user: { ...user, paymentMethods: newPayments } });
      toast({ title: 'Success', description: 'Payment method has been deleted.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };
  
  const handlePasswordChange = async (data: any) => {
      const result = await updateUserPassword(user.email!, data.currentPassword, data.newPassword);
      if(result.success) {
          toast({title: 'Success', description: 'Your password has been updated.'});
          setIsPasswordDialogOpen(false);
      } else {
           toast({title: 'Error', description: result.error, variant: 'destructive'});
      }
  }


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
                  <Button variant="outline" size="sm" onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
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
                  {isLoading ? (
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
              <Button onClick={() => { setEditingAddress(null); setIsAddressDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Address
              </Button>
            </CardHeader>
            <CardContent>
                {addresses.length === 0 ? (
                     <p className="text-sm text-muted-foreground text-center py-16">You have no saved addresses.</p>
                ) : (
                    <div className="space-y-4">
                        {addresses.map(addr => (
                             <div key={addr.id} className="border p-4 rounded-lg flex justify-between items-start">
                                <div>
                                    {addr.isDefault && <Badge>Default</Badge>}
                                    <p className="font-semibold mt-1">{addr.fullName}</p>
                                    <p className="text-muted-foreground text-sm">{addr.streetAddress}</p>
                                    <p className="text-muted-foreground text-sm">{addr.city}, {addr.state} {addr.zipCode}</p>
                                    <p className="text-muted-foreground text-sm">{addr.country}</p>
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => { setEditingAddress(addr); setIsAddressDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(addr.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Payment Methods</CardTitle>
                        <CardDescription>Manage your saved payment options.</CardDescription>
                    </div>
                    <Button onClick={() => { setEditingPayment(null); setIsPaymentDialogOpen(true); }}>
                         <PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method
                    </Button>
                </CardHeader>
                <CardContent>
                   {payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-16">You have no saved payment methods.</p>
                   ) : (
                    <div className="space-y-4">
                        {payments.map(pay => (
                             <div key={pay.id} className="border p-4 rounded-lg flex justify-between items-start">
                                <div>
                                    {pay.isDefault && <Badge>Default</Badge>}
                                    <p className="font-semibold mt-1 flex items-center gap-2">
                                        <CreditCard className="h-5 w-5"/>
                                        <span>{pay.cardType} ending in {pay.last4}</span>
                                    </p>
                                    <p className="text-muted-foreground text-sm">Expires {pay.expiryDate}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(pay); setIsPaymentDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeletePayment(pay.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                   )}
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
                    {wishlist.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-16">Your wishlist is empty.</p>
                    ) : (
                        <div className="space-y-4">
                            {wishlist.map(item => (
                                <div key={item.id} className="flex items-center gap-4 border p-2 rounded-lg">
                                    <Image src={item.images[0]} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                                    <div className="flex-grow">
                                        <Link href={`/products/${item.id}`} className="font-semibold hover:underline">{item.name}</Link>
                                        <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                       <Button size="sm" onClick={() => {
                                            addToCart(item);
                                            removeFromWishlist(item.id);
                                            toast({ title: 'Moved to Cart!', description: `${item.name} has been added to your cart.` });
                                       }}>Add to Cart</Button>
                                       <Button size="sm" variant="outline" onClick={() => removeFromWishlist(item.id)}>Remove</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                    {userReviews.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-16">You have not submitted any reviews.</p>
                    ) : (
                        <div className="space-y-4">
                            {userReviews.map(review => {
                                const product = allProducts.find(p => p.id === review.productId);
                                return (
                                <div key={review.id} className="border p-4 rounded-lg">
                                    {product && <p className="text-sm font-semibold text-muted-foreground">For: <Link href={`/products/${product.id}`} className="underline hover:text-primary">{product.name}</Link></p>}
                                    <div className="flex items-center my-2">
                                        <Star /> 
                                        <span className="ml-1">{review.rating}/5</span>
                                        <p className="ml-auto text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm">{review.comment}</p>
                                </div>
                                );
                            })}
                        </div>
                    )}
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
    <>
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
                    <NavButton section="orders" label="My Orders" icon={<Home />} />
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
    <AddressDialog
        isOpen={isAddressDialogOpen}
        onClose={() => setIsAddressDialogOpen(false)}
        onSave={handleSaveAddress}
        address={editingAddress}
    />
    <PaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        onSave={handleSavePayment}
        paymentMethod={editingPayment}
    />
    <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onSave={handlePasswordChange}
    />
    </>
  );
}
