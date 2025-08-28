import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle } from "lucide-react"

const benefits = [
  "Reach a global audience of conscious consumers.",
  "Earn fair prices for your incredible craftsmanship.",
  "Receive support and training to grow your business.",
  "Be part of a community dedicated to preserving Indian heritage."
]

export default function SellPage() {
  return (
    <div className="container mx-auto py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Become a VRIDHIRA Artisan</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Share your craft with the world and build a sustainable future for your art. Join our community of talented artisans today.
          </p>
          <div className="mt-8 space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Register Your Interest</CardTitle>
            <CardDescription>Fill out the form below, and our team will get in touch with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Your Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="craft">Your Craft/Specialty</Label>
                <Input id="craft" placeholder="e.g., Pottery, Weaving, Woodwork" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Tell Us About Yourself</Label>
                <Textarea id="message" placeholder="A brief introduction to you and your work." />
              </div>
              <Button type="submit" className="w-full">Register Now</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
