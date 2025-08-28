import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard } from "lucide-react";

export default function CheckoutPage() {
  return (
    <div className="container mx-auto py-16 md:py-24 text-center">
        <CreditCard className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="mt-2 text-lg text-muted-foreground">
            This is where the checkout process will happen.
        </p>
        <Button asChild className="mt-6">
            <Link href="/products">Continue Shopping</Link>
        </Button>
    </div>
  )
}
