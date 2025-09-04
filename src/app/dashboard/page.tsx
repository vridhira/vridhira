
'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllUsers, handleRoleChange } from '@/lib/user-actions';
import { UserManagementTable } from '@/components/dashboard/UserManagementTable';
import { UserList } from '@/components/dashboard/UserList';
import { UpsertUserDialog } from '@/components/dashboard/UpsertUserDialog';
import { getProductsByArtisan, products as allProducts } from '@/lib/data';
import { ProductManagementTable } from '@/components/dashboard/ProductManagementTable';
import { AddProductDialog } from '@/components/dashboard/AddProductDialog';


export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  const userRole = user?.role;

  if (!user || !userRole || !['owner', 'admin', 'shopkeeper'].includes(userRole)) {
    redirect('/');
  }

  const isOwner = userRole === 'owner';
  const isAdmin = userRole === 'admin';
  const isShopkeeper = userRole === 'shopkeeper';
  
  // Conditionally render based on role
  if (isShopkeeper) {
      const shopProducts = await getProductsByArtisan(user.id);
      return (
        <div className="container mx-auto py-12">
           <header className="mb-10">
              <h1 className="text-4xl font-headline tracking-tight">My Shop Dashboard</h1>
              <p className="text-muted-foreground mt-2">Manage your products and view your sales.</p>
            </header>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>View, add, and manage the products in your shop.</CardDescription>
                 </div>
                 <AddProductDialog artisanId={user.id} />
              </CardHeader>
              <CardContent>
                  <ProductManagementTable products={shopProducts} />
              </CardContent>
            </Card>
        </div>
      )
  }

  // Owner and Admin view
  const users = await getAllUsers();
  const shopkeepers = users.filter(u => u.role === 'shopkeeper');
  const admins = users.filter(u => u.role === 'admin');
  
  return (
    <div className="container mx-auto py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-headline tracking-tight">Marketplace Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your entire marketplace from one place.</p>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="shopkeepers">Shopkeepers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View, manage, and assign roles to all users in the system.</CardDescription>
              </div>
              {isOwner && <UpsertUserDialog />}
            </CardHeader>
            <CardContent>
                <UserManagementTable users={users} onRoleChange={handleRoleChange} isOwner={isOwner} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="shopkeepers">
            <Card>
              <CardHeader>
                <CardTitle>Shopkeeper Management</CardTitle>
                <CardDescription>All users with the 'shopkeeper' role.</CardDescription>
              </CardHeader>
              <CardContent>
                  <UserList users={shopkeepers} />
              </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle>Product Management</CardTitle>
                    <CardDescription>View and manage all products in the marketplace.</CardDescription>
                 </div>
                 <AddProductDialog artisanId={user.id} />
              </CardHeader>
              <CardContent>
                  <ProductManagementTable products={allProducts} />
              </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>All users with the 'admin' role. Owners can promote or demote admins.</CardDescription>
              </CardHeader>
              <CardContent>
                  <UserList users={admins} />
              </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
