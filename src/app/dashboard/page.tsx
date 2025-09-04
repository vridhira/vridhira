
'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllUsers, handleRoleChange } from '@/lib/user-actions';
import { UserManagementTable } from '@/components/dashboard/UserManagementTable';
import { UserList } from '@/components/dashboard/UserList';

export default async function DashboardPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  if (userRole !== 'owner' && userRole !== 'admin') {
    redirect('/');
  }

  const isOwner = userRole === 'owner';

  const users = await getAllUsers();
  const shopkeepers = users.filter(user => user.role === 'shopkeeper');
  const admins = users.filter(user => user.role === 'admin');
  
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
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, manage, and assign roles to all users in the system.</CardDescription>
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
              </Header>
              <CardContent>
                  <UserList users={shopkeepers} />
              </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>Manage all products in the marketplace.</CardDescription>
              </Header>
              <CardContent>
                  <p className="text-muted-foreground text-center py-10">Product management UI coming soon.</p>
              </CardContent>
            </Card>
        </TabsContent>

         <TabsContent value="admins">
            <Card>
              <CardHeader>
                <CardTitle>Admin Management</CardTitle>
                <CardDescription>All users with the 'admin' role. Owners can promote or demote admins.</CardDescription>
              </Header>
              <CardContent>
                  <UserList users={admins} />
              </CardContent>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
