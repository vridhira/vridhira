
'use client';

import { useState } from 'react';
import type { User, UserRole } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSession, signOut } from 'next-auth/react';

interface UserManagementTableProps {
  users: User[];
  onRoleChange: (userId: string, role: UserRole) => Promise<{ error?: string } | void>;
  currentActor: User; // The currently logged-in user performing the action
}

const ROLES_HIERARCHY: { [key in UserRole]: number } = {
  user: 1,
  shopkeeper: 2,
  admin: 3,
  owner: 4,
};

const ROLES: UserRole[] = ['user', 'shopkeeper', 'admin']; // Roles that can be assigned

export function UserManagementTable({ users, onRoleChange, currentActor }: UserManagementTableProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const handleRoleSelect = async (targetUser: User, newRole: UserRole) => {
    setIsSubmitting(targetUser.id);
    const result = await onRoleChange(targetUser.id, newRole);
    if (result?.error) {
      toast({
        title: 'Permission Denied',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: `User ${targetUser.email}'s role has been updated to ${newRole}.`,
      });

      // If the user changed their own role, sign them out to apply changes
      if (targetUser.id === session?.user?.id) {
        await signOut({ callbackUrl: '/' });
      }
    }
    setIsSubmitting(null);
  };
  
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'destructive';
      case 'shopkeeper':
        return 'secondary';
      case 'user':
      default:
        return 'outline';
    }
  }

  const canChangeRole = (targetRole: UserRole) => {
    const actorRole = currentActor.role;
    const actorLevel = ROLES_HIERARCHY[actorRole];
    const targetLevel = ROLES_HIERARCHY[targetRole];

    if (actorRole === 'owner') return true; // Owner can manage anyone
    if (actorRole === 'admin') return targetLevel < actorLevel; // Admin can manage shopkeepers and users
    
    return false;
  };
  
  const canBePromotedTo = (newRole: UserRole) => {
      // Only owners can promote users to 'admin'
      if (newRole === 'admin') {
          return currentActor.role === 'owner';
      }
      return true;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.id.substring(0, 8)}...</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
            <TableCell>
              <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
            </TableCell>
            <TableCell className="text-right">
              {canChangeRole(user.role) ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={!!isSubmitting}>
                      {isSubmitting === user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {ROLES.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => handleRoleSelect(user, role)}
                        disabled={
                           user.role === role || 
                           !!isSubmitting ||
                           !canBePromotedTo(role)
                        }
                      >
                        Promote to {role.charAt(0).toUpperCase() + role.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                 <Button variant="ghost" size="icon" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
