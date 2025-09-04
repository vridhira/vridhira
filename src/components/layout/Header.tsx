
'use client';

import Link from "next/link"
import { Menu, Search, ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react"
import { useCart } from "@/context/CartContext"
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
import { useSession, signOut } from "next-auth/react";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/sell", label: "Sell" },
]

export function Header() {
  const { data: session, status } = useSession();
  const { cartCount } = useCart();
  const isLoading = status === 'loading';

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };


  const UserNav = () => {
    if (isLoading) {
      return (
        <Avatar className="h-9 w-9">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
      )
    }
    
    if (session) {
      const userRole = session.user?.role;
      const canAccessDashboard = userRole === 'owner' || userRole === 'admin' || userRole === 'shopkeeper';
      
      const getDashboardLabel = () => {
        switch(userRole) {
            case 'owner': return 'Owner Dashboard';
            case 'admin': return 'Admin Dashboard';
            case 'shopkeeper': return 'Shop Dashboard';
            default: return 'Dashboard';
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? 'User'} />
              <AvatarFallback>{session.user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/account" passHref>
              <DropdownMenuItem>
                <User className="mr-2" />
                My Account
              </DropdownMenuItem>
            </Link>
             {canAccessDashboard && (
                <Link href="/dashboard" passHref>
                    <DropdownMenuItem>
                        <LayoutDashboard className="mr-2" />
                        {getDashboardLabel()}
                    </DropdownMenuItem>
                </Link>
             )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    return (
       <Link href="/login">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </Link>
    )
  }

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
              <Button variant="ghost" size="icon" className="relative">
                {cartCount > 0 && <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0">{cartCount}</Badge>}
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Shopping Cart</span>
              </Button>
            </Link>
            <UserNav />
          </nav>
          
          {/* Mobile Menu and Actions */}
          <div className="flex items-center md:hidden">
            <nav className="flex items-center">
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                   {cartCount > 0 && <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0">{cartCount}</Badge>}
                  <ShoppingCart className="h-5 w-5" />
                  <span className="sr-only">Shopping Cart</span>
                </Button>
              </Link>
              <UserNav />
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
