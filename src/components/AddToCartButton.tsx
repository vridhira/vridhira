"use client"

import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/data"

export function AddToCartButton({ product }: { product: Product }) {
  const { toast } = useToast()

  const handleAddToCart = () => {
    // Here you would typically add the product to a cart state
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your shopping cart.`,
    })
  }

  return (
    <Button size="lg" className="w-full" onClick={handleAddToCart}>
      <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
    </Button>
  )
}
