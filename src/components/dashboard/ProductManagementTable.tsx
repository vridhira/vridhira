
'use client';

import type { Product } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';

interface ProductManagementTableProps {
  products: Product[];
}

export function ProductManagementTable({ products }: ProductManagementTableProps) {
  if (products.length === 0) {
    return <p className="text-muted-foreground text-center py-10">No products found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {product.id}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">{product.category}</Badge>
            </TableCell>
            <TableCell>${product.price.toFixed(2)}</TableCell>
            <TableCell>{product.rating.toFixed(1)} ({product.reviewCount})</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="icon" disabled>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
