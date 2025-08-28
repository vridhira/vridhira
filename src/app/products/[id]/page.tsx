import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products, artisans, reviews as allReviews } from '@/lib/data';
import type { Product, Artisan } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AddToCartButton } from '@/components/AddToCartButton';


export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = products.find(p => p.id === params.id) as Product | undefined;
  
  if (!product) {
    notFound();
  }
  
  const artisan = artisans.find(a => a.id === product.artisanId) as Artisan | undefined;
  const reviews = allReviews.filter(r => r.productId === product.id);

  return (
    <div className="container mx-auto py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <Carousel className="w-full rounded-lg overflow-hidden border">
            <CarouselContent>
              {product.images.map((img, index) => (
                <CarouselItem key={index}>
                    <div className="p-0">
                      <Image
                        src={img}
                        alt={`${product.name} image ${index + 1}`}
                        width={800}
                        height={800}
                        className="w-full h-full object-cover aspect-square"
                      />
                    </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {product.images.length > 1 && <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>}
          </Carousel>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">{product.name}</h1>
          <div className="mt-3 flex items-center">
            <StarRating rating={product.rating} />
            <span className="ml-3 text-sm text-muted-foreground">
              {product.reviewCount} reviews
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-foreground">${product.price.toFixed(2)}</p>
          <Separator className="my-6" />
          <p className="text-base text-foreground/80 leading-relaxed">{product.description}</p>
          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
          {artisan && (
            <Card className="mt-8">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={artisan.profileImage} alt={artisan.name} />
                    <AvatarFallback>{artisan.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Sold by</p>
                    <CardTitle className="text-lg">{artisan.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{artisan.location}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-6">Customer Reviews</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {reviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-2">
                    <StarRating rating={review.rating} />
                    <p className="ml-auto text-sm text-muted-foreground">{new Date(review.date).toLocaleDateString()}</p>
                  </div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-muted-foreground mt-1">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
             {reviews.length === 0 && <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>}
          </div>
          <div>
            <Card>
                <CardHeader>
                    <CardTitle>Write a review</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Share your thoughts with other customers.</p>
                    <Button className="mt-4 w-full" variant="outline">Write a customer review</Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
