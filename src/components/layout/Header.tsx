'use client'

import Link from "next/link"
import { Menu, Search, ShoppingCart, User } from "lucide-react"
import { useSession, signIn } from 'next-auth/react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Logo } from "@/components/Logo"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/sell", label: "Become a Seller" },
]

export function Header() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-24 items-center">
        {/* Left Section: Logo */}
        <div className="flex-none">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>

        {/* Center Section: Search (Desktop) */}
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-sm">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="w-full pl-9"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Right Section: Nav and Actions */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                     <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/cart">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </Link>
            {!isLoading && session ? (
              <Link href="/account">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? 'User'} />
                  <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => signIn('github')}>
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            )}
          </nav>
          
          {/* Mobile Menu and Actions */}
          <div className="flex items-center md:hidden">
            <nav className="flex items-center">
              <Link href="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping Cart</span>
                </Button>
              </Link>
              {!isLoading && session ? (
                <Link href="/account">
                   <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? 'User'} />
                    <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => signIn('github')}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              )}
            </nav>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] bg-background/95 backdrop-blur-lg">
                <SheetHeader>
                  <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col items-start space-y-4 pt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
