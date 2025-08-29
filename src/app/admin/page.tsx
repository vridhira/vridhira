'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { products as initialProducts } from '@/lib/data';
import type { Product } from '@/lib/data';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, PlusCircle, Trash2 } from 'lucide-react';

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="mt-4 text-2xl font-headline">Admin Access</CardTitle>
          <CardDescription>Enter your credentials to manage the store.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="admin"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full !mt-6">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, category, image } = newProduct;
    if (name && description && price && category && image) {
      const newId = `prod-${Math.random().toString(36).substr(2, 9)}`;
      const newProductData: Product = {
        id: newId,
        name,
        description,
        price: parseFloat(price),
        category,
        images: [URL.createObjectURL(image)],
        artisanId: 'artisan-1', // Default artisan for now
        rating: 0,
        reviewCount: 0,
      };
      setProducts((prev) => [newProductData, ...prev]);
      setNewProduct({ name: '', description: '', price: '', category: '', image: null });
       toast({
        title: "Product Added!",
        description: `${name} has been added to the store.`,
      });
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please fill out all fields and upload an image.",
        });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
     toast({
        title: "Product Removed!",
        description: `The product has been removed from the store.`,
      });
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container py-12">
        <header className="mb-12 text-center">
            <h1 className="text-4xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">Manage your products and store settings.</p>
        </header>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <PlusCircle className="text-primary" />
                  Add New Product
                </CardTitle>
                <CardDescription>Fill in the details below to add a new item.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} rows={4} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input id="price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" name="category" value={newProduct.category} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Product Image</Label>
                    <Input id="image" type="file" onChange={handleFileChange} accept="image/*" className="file:text-primary file:font-semibold" />
                  </div>
                  <Button type="submit" className="w-full !mt-6">
                    Add Product
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Existing Products</CardTitle>
                <CardDescription>Manage and remove products from your store.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                  {products.length > 0 ? products.map((product) => (
                    <div key={product.id} className="flex items-center gap-6 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover aspect-square"
                      />
                      <div className="flex-grow">
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                        <p className="text-lg font-bold text-primary mt-1">${product.price.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-8">No products yet. Add one to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return <AdminDashboard />;
}
