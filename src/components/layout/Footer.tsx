import Link from "next/link"
import { Logo } from "@/components/Logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-sm">
              Discover authentic Indian handicrafts, sourced directly from talented local artisans.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-primary transition-colors">All Products</Link></li>
              <li><Link href="/products?category=Textiles" className="hover:text-primary transition-colors">Textiles</Link></li>
              <li><Link href="/products?category=Pottery" className="hover:text-primary transition-colors">Pottery</Link></li>
              <li><Link href="/products?category=Woodwork" className="hover:text-primary transition-colors">Woodwork</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link href="/sell" className="hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm mb-2">Subscribe for updates and special offers.</p>
            <form className="flex gap-2">
              <Input type="email" placeholder="Your email" className="bg-background" />
              <Button type="submit" variant="default">Subscribe</Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} VRIDHIRA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
