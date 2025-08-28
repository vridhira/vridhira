import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  return (
    <div className="container mx-auto py-16 md:py-24 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Your Cart is Empty</h1>
        <p className="mt-2 text-lg text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
        </p>
        <Button asChild className="mt-6">
            <Link href="/products">Start Shopping</Link>
        </Button>
    </div>
  )
}
