import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="container mx-auto py-16 md:py-24 text-center">
        <User className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">My Account</h1>
        <p className="mt-2 text-lg text-muted-foreground">
            This is where user account details, order history, etc., will be displayed.
        </p>
        <Button asChild className="mt-6" variant="outline">
            <Link href="/login">Logout</Link>
        </Button>
    </div>
  )
}
