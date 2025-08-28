import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { products, categories, artisans } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const featuredProducts = products.slice(0, 4);
  const featuredArtisans = artisans.slice(0, 2);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh]">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="container mx-auto flex flex-col items-center justify-center h-full text-center z-20 relative">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-200 font-headline">
            Handcrafted with Heart & Soul
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
            Discover unique creations from India's most talented artisans.
          </p>
          <Button asChild size="lg" className="mt-8" variant="accent">
            <Link href="/products">Explore Collection</Link>
          </Button>
        </div>
        <Image
          src="https://picsum.photos/1600/900?pottery"
          alt="Artisan crafting a pot"
          fill
          className="object-cover"
          priority
          data-ai-hint="pottery making"
        />
      </section>

      {/* Featured Products Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10 font-headline">
            Best-Selling Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/products">
                View All Products <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10 font-headline">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={`/products?category=${category.name}`} className="group relative block overflow-hidden rounded-lg">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={400}
                  height={300}
                  className="w-full aspect-square md:aspect-[4/3] object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={category.data_ai_hint}
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artisans Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-10 font-headline">
            Meet Our Artisans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {featuredArtisans.map((artisan) => (
              <Card key={artisan.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary/10">
                    <AvatarImage src={artisan.profileImage} alt={artisan.name} data-ai-hint="artisan portrait" />
                    <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold">{artisan.name}</h3>
                    <p className="text-sm text-muted-foreground">{artisan.location}</p>
                    <p className="mt-2 text-sm">{artisan.bio.substring(0, 100)}...</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link href="/about">
                Read Our Story <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24 bg-transparent">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight mb-4 font-headline">Our Mission</h2>
          <p className="text-lg text-muted-foreground">
            To empower local artisans by connecting them to a global market, preserving traditional crafts, and celebrating the rich cultural heritage of India.
          </p>
          <Button asChild variant="accent" size="lg" className="mt-8">
            <Link href="/sell">Join as a Seller</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
