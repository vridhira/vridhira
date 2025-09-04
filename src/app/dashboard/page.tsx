
'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllUsers, updateUserRole } from '@/lib/user-actions';
import { UserManagementTable } from '@/components/dashboard/UserManagementTable';
import type { User, UserRole } from '@/lib/types';


export default async function DashboardPage() {
  const session = await auth();

  if (session?.user?.role !== 'owner') {
    redirect('/');
  }

  const users = await getAllUsers();
  
  const handleRoleChange = async (userId: string, role: UserRole) => {
    'use server';
    // You might want to add extra checks here, e.g., an owner cannot be demoted by another owner.
    // For now, it directly calls the update action.
    try {
      await updateUserRole(userId, role);
      // Revalidate path or redirect to refresh data.
      // For this server component, a page refresh would show the change.
      // With client components, you'd re-fetch data.
    } catch (error) {
      console.error("Failed to update role:", error);
      // Handle error display to the user
      return { error: 'Failed to update role.' };
    }
  };


  return (
    <div className="container mx-auto py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-headline tracking-tight">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage your entire marketplace from one place.</p>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="shopkeepers" disabled>Shopkeepers</TabsTrigger>
          <TabsTrigger value="products" disabled>Products</TabsTrigger>
          <TabsTrigger value="admins" disabled>Admins</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View, manage, and assign roles to all users in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <UserManagementTable users={users} onRoleChange={handleRoleChange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        <TabsContent value="shopkeepers">
            {/* Shopkeeper management table will go here */}
        </TabsContent>
         <TabsContent value="products">
            {/* Product management table will go here */}
        </TabsContent>
         <TabsContent value="admins">
            {/* Admin management table will go here */}
        </TabsContent>

      </Tabs>
    </div>
  );
}
