

'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllUsers, handleRoleChange, findUserById } from '@/lib/user-actions';
import { UserManagementTable } from '@/components/dashboard/UserManagementTable';
import { UserList } from '@/components/dashboard/UserList';
import { UpsertUserDialog } from '@/components/dashboard/UpsertUserDialog';
import { getProductsByArtisan } from '@/lib/product-actions';
import { ProductManagementTable } from '@/components/dashboard/ProductManagementTable';
import { AddProductDialog } from '@/components/dashboard/AddProductDialog';
import { products as allProducts } from '@/lib/data';


export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;

  // Security check: Only owners, admins, and shopkeepers can access the dashboard.
  if (!user || !user.id || !user.role || !['owner', 'admin', 'shopkeeper'].includes(user.role)) {
    redirect('/account'); // Regular users are sent to their account page.
  }
  
  // We need to fetch the full, most up-to-date user object from our database
  // to ensure the role is current and not from a stale session.
  const currentActor = await findUserById(user.id);
  
  // Extra security check in case the user was deleted or their role was changed to 'user'.
  if (!currentActor || !['owner', 'admin', 'shopkeeper'].includes(currentActor.role)) {
       redirect('/');
  }

  const isOwner = currentActor.role === 'owner';
  const isAdmin = currentActor.role === 'admin';
  const isShopkeeper = currentActor.role === 'shopkeeper';
  
  // --- Shopkeeper Dashboard View ---
  if (isShopkeeper) {
      const shopProducts = await getProductsByArtisan(currentActor.id);
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
                 <AddProductDialog artisanId={currentActor.id} />
              </CardHeader>
              <CardContent>
                  <ProductManagementTable products={shopProducts} />
              </CardContent>
            </Card>
        </div>
      )
  }

  // --- Owner and Admin Dashboard View ---
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
          {isOwner && <TabsTrigger value="admins">Admins</TabsTrigger>}
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View, manage, and assign roles to all users in the system.</CardDescription>
              </div>
              {(isOwner || isAdmin) && <UpsertUserDialog />}
            </CardHeader>
            <CardContent>
                <UserManagementTable users={users} onRoleChange={handleRoleChange} currentActor={currentActor} />
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
                  <UserList users={shopkeepers} currentActor={currentActor} />
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
                 <AddProductDialog artisanId={currentActor.id} />
              </CardHeader>
              <CardContent>
                  <ProductManagementTable products={allProducts} />
              </CardContent>
            </Card>
        </TabsContent>
        
        {isOwner && (
         <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>All users with the 'admin' role. Only owners can promote or demote admins.</CardDescription>
              </CardHeader>
              <CardContent>
                  <UserList users={admins} currentActor={currentActor} />
              </CardContent>
            </Card>
        </TabsContent>
        )}

      </Tabs>
    </div>
  );
}
