
import { products } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { ProductFilters } from '@/components/ProductFilters';

export default function ProductsPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {

  return (
    <div className="container py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Our Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Browse through our exquisite collection of handmade treasures.</p>
      </div>

      <Separator className="my-8" />
      
      <ProductFilters products={products} initialCategory={searchParams?.category as string || 'All'} />

    </div>
  );
}
