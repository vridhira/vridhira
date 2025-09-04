
'use client';

import type { User } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserListProps {
  users: User[];
  currentActor: User;
}

export function UserList({ users, currentActor }: UserListProps) {
  
  const getRoleBadgeVariant = (role: User['role']) => {
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

  if (users.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No users found in this category.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone Number</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isOwner = user.role === 'owner';
          const isAdminViewing = currentActor.role === 'admin';

          if (isOwner && isAdminViewing) {
            return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-muted text-muted-foreground">Owner</AvatarFallback>
                    </Avatar>
                    <p className="font-medium text-muted-foreground italic">Owner</p>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground italic">Hidden</TableCell>
                <TableCell className="text-muted-foreground italic">Hidden</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                </TableCell>
              </TableRow>
            );
          }
          
          return (
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
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  );
}
