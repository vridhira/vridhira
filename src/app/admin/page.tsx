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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Please enter your credentials to access the dashboard.</CardDescription>
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
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
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
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" value={newProduct.name} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" value={newProduct.description} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" value={newProduct.price} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" value={newProduct.category} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <Input id="image" type="file" onChange={handleFileChange} accept="image/*" />
                </div>
                <Button type="submit" className="w-full">
                  Add Product
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Existing Products</CardTitle>
              <CardDescription>Manage and remove products from your store.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 border rounded-md">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveProduct(product.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
