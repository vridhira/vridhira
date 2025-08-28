import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">The Story of VRIDHIRA</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A celebration of heritage, craftsmanship, and community.
          </p>
        </div>

        <div className="relative w-full h-96 mt-12 rounded-lg overflow-hidden">
          <Image
            src="https://picsum.photos/1200/800?about=1"
            alt="Group of artisans working together"
            fill
            className="object-cover"
            data-ai-hint="artisan group"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-12 mt-16 max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold font-headline mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              VRIDHIRA was born from a simple yet powerful idea: to bring the authentic, handcrafted treasures of India to the world, while empowering the local artisans who create them. Our mission is to build a sustainable bridge between tradition and modernity, ensuring that ancient crafts not only survive but thrive in the digital age. We believe in fair trade, transparent practices, and the profound beauty of items made with human hands.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold font-headline mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              We envision a world where every purchase makes a positive impact. By choosing VRIDHIRA, you are not just buying a product; you are supporting a family, preserving a culture, and becoming part of a story that spans generations. We aim to be the leading platform for ethical and authentic Indian handicrafts, a place where conscious consumers can connect directly with the heart of India's creative soul.
            </p>
          </div>
        </div>

        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold font-headline mb-6">Ready to Join Our Community?</h2>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" variant="default">
              <Link href="/products">Explore Our Crafts</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/sell">Sell with Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
