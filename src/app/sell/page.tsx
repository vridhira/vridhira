
'use client';

import { Button } from "@/components/ui/button"
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, Store, Users, HandCoins } from "lucide-react";

const benefits = [
  { 
    icon: <Store className="h-6 w-6 text-primary" />,
    title: "Global Reach",
    description: "Showcase your craft to a worldwide audience of conscious consumers." 
  },
  { 
    icon: <HandCoins className="h-6 w-6 text-primary" />,
    title: "Fair & Transparent",
    description: "Earn fair prices for your craftsmanship with a clear and simple fee structure." 
  },
  { 
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Community & Support",
    description: "Join a community dedicated to preserving heritage and growing together." 
  },
]

export default function SellPage() {

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32">
         <div className="absolute inset-0 bg-primary/10 z-0" />
         <div className="container mx-auto text-center z-10 relative">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Join the VRIDHIRA Artisan Marketplace</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Turn your passion into a thriving business. Share your unique, handcrafted creations with the world.
            </p>
            <div className="mt-8 flex justify-center gap-4">
               <Button asChild size="lg">
                 <Link href="/vendor/signup">Start Selling Now</Link>
               </Button>
               <Button asChild size="lg" variant="outline">
                 <Link href="/vendor/login">Seller Login</Link>
               </Button>
            </div>
         </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold font-headline">Why Sell with VRIDHIRA?</h2>
            <p className="mt-3 text-muted-foreground">
              We provide the tools, support, and audience to help you succeed. Focus on your craft, and we'll handle the rest.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-8 text-center">
            {benefits.map((benefit, index) => (
              <div key={index} className="p-6 rounded-lg">
                <div className="flex justify-center items-center h-12 w-12 rounded-full bg-primary/10 mx-auto">
                    {benefit.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{benefit.title}</h3>
                <p className="mt-2 text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
       {/* How it works Section */}
        <section className="py-16 md:py-24 bg-muted">
            <div className="container mx-auto">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold font-headline">Simple Steps to Start Selling</h2>
                </div>
                <div className="mt-12 grid md:grid-cols-3 gap-8 items-start">
                     <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">1.</div>
                        <h3 className="text-xl font-semibold">Create Your Shop</h3>
                        <p className="text-muted-foreground mt-2">Register as a seller and set up your personalized shop front. Tell your story and what makes your craft unique.</p>
                    </div>
                     <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">2.</div>
                        <h3 className="text-xl font-semibold">List Your Products</h3>
                        <p className="text-muted-foreground mt-2">Upload high-quality photos and detailed descriptions of your handmade items through your seller dashboard.</p>
                    </div>
                     <div className="text-center">
                        <div className="text-4xl font-bold text-primary mb-2">3.</div>
                        <h3 className="text-xl font-semibold">Start Earning</h3>
                        <p className="text-muted-foreground mt-2">Once a customer places an order, you ship the item directly. We handle the payment processing for you.</p>
                    </div>
                </div>
                 <div className="text-center mt-12">
                     <Button asChild size="lg">
                        <Link href="/vendor/signup">Become a Seller Today</Link>
                    </Button>
                </div>
            </div>
        </section>

    </div>
  )
}
