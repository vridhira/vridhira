
'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, cartCount } = useCart();
  const totalItems = cartCount;

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="mb-8 flex items-center gap-4">
        <ShoppingCart className="h-8 w-8" />
        <div>
            <h1 className="text-3xl font-headline tracking-tight">Your Cart</h1>
            <p className="text-muted-foreground">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
        </div>
      </header>

      {cartItems.length === 0 ? (
        <Card className="shadow-none border-dashed">
          <CardContent className="text-center py-20">
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {cartItems.map((item) => (
                 <Card key={item.id} className="overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                        <div className="relative h-28 w-28 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                            src={item.images[0]}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                        </div>
                        <div className="flex-grow">
                        <Link href={`/products/${item.id}`} className="font-semibold text-lg hover:underline">
                            {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                         <p className="text-lg font-bold text-primary mt-2">
                            ${item.price.toFixed(2)}
                        </p>
                        </div>
                        <div className="flex flex-col items-end justify-between self-stretch">
                           <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                <span className="sr-only">Remove item</span>
                            </Button>
                            <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 1)}
                                className="w-20 text-center"
                                aria-label="Quantity"
                            />
                        </div>
                    </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28">
               <Card>
                <CardContent className="p-6">
                    <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-3">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="font-medium">Free</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Taxes</span>
                        <span className="font-medium">Calculated at checkout</span>
                    </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <Button asChild size="lg" className="w-full mt-6">
                        <Link href="/checkout">Proceed to Checkout</Link>
                    </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
