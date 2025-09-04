
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Product } from './data';
import { auth } from '@/auth';

const productsFilePath = path.join(process.cwd(), 'src', 'lib', 'products.json');

const readProducts = (): Product[] => {
  try {
    if (!fs.existsSync(productsFilePath)) {
      const initialDataPath = path.join(process.cwd(), 'src', 'lib', 'data.ts');
      fs.writeFileSync(productsFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(productsFilePath, 'utf8');
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading products file:", error);
    throw new Error("Could not read product data.");
  }
};

const writeProducts = (products: Product[]) => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("Error writing products file:", error);
    throw new Error("Could not save product data.");
  }
};

// First time setup: If products.json is empty, populate it from data.ts
const initialSetup = () => {
    try {
        const products = readProducts();
        if (products.length === 0) {
            const initialProducts: Product[] = [
              {
                id: '1',
                name: 'Hand-Painted Ceramic Vase',
                price: 45.0,
                description: 'A beautifully hand-painted ceramic vase, perfect for adding a touch of elegance to any room. Each vase is unique, featuring intricate patterns inspired by traditional Indian art forms. Made with high-quality clay and lead-free glazes.',
                images: ['https://picsum.photos/600/600?product=1-1', 'https://picsum.photos/600/600?product=1-2', 'https://picsum.photos/600/600?product=1-3'],
                category: 'Pottery',
                rating: 4.8,
                reviewCount: 124,
                artisanId: 'artisan-1',
              },
              {
                id: '2',
                name: 'Block-Printed Cotton Scarf',
                price: 25.0,
                description: 'A soft, lightweight cotton scarf featuring traditional block-printing techniques. The dye is made from natural ingredients, making it eco-friendly. Ideal for all seasons and adds a stylish touch to any outfit.',
                images: ['https://picsum.photos/600/600?product=2-1', 'https://picsum.photos/600/600?product=2-2'],
                category: 'Textiles',
                rating: 4.6,
                reviewCount: 88,
                artisanId: 'artisan-2',
              },
              {
                id: '3',
                name: 'Carved Rosewood Elephant',
                price: 75.0,
                description: 'An exquisite elephant figurine, hand-carved from a single piece of sustainably sourced rosewood. The detailed craftsmanship showcases the skill of the artisan. A perfect piece for collectors or as a statement home decor item.',
                images: ['https://picsum.photos/600/600?product=3-1', 'https://picsum.photos/600/600?product=3-2'],
                category: 'Woodwork',
                rating: 4.9,
                reviewCount: 210,
                artisanId: 'artisan-3',
              },
              {
                id: '4',
                name: 'Terracotta Diyas (Set of 4)',
                price: 15.0,
                description: 'A set of four traditional terracotta diyas (oil lamps), handcrafted by potters in rural India. Perfect for festivals, meditation, or creating a serene ambiance in your home. Simple, rustic, and full of charm.',
                images: ['https://picsum.photos/600/600?product=4-1'],
                category: 'Pottery',
                rating: 4.7,
                reviewCount: 156,
                artisanId: 'artisan-1',
              },
              {
                id: '5',
                name: 'Embroidered Cushion Cover',
                price: 35.0,
                description: 'A vibrant cushion cover with intricate mirror-work embroidery, typical of the Kutch region. Made from high-quality cotton fabric, it adds a pop of color and texture to your living space. (Cushion not included).',
                images: ['https://picsum.photos/600/600?product=5-1', 'https://picsum.photos/600/600?product=5-2'],
                category: 'Textiles',
                rating: 4.5,
                reviewCount: 72,
                artisanId: 'artisan-2',
              },
                {
                id: '6',
                name: 'Handmade Wooden Spice Box',
                price: 60.0,
                description: 'A beautifully crafted wooden spice box with multiple compartments to store your favorite spices. The lid features a small, carved design, and the wood is finished with a natural oil to preserve its beauty.',
                images: ['https://picsum.photos/600/600?product=6-1', 'https://picsum.photos/600/600?product=6-2'],
                category: 'Woodwork',
                rating: 4.8,
                reviewCount: 95,
                artisanId: 'artisan-3',
              },
            ];
            writeProducts(initialProducts);
        }
    } catch (e) {
        // Silently fail setup
    }
};

initialSetup();


type CreateProductData = {
  name: string;
  description: string;
  price: number;
  category: string;
  artisanId: string;
};

export const createProduct = async (data: CreateProductData) => {
  'use server';
  try {
    const products = readProducts();

    const newProduct: Product = {
      id: `${Date.now()}`,
      name: data.name,
      price: data.price,
      description: data.description,
      images: ['https://picsum.photos/600/600?new-product'],
      category: data.category,
      rating: 0,
      reviewCount: 0,
      artisanId: data.artisanId,
    };

    products.push(newProduct);
    writeProducts(products);

    revalidatePath('/dashboard');
    revalidatePath('/products');

    return { success: true };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
};

export const deleteProduct = async (productId: string) => {
    'use server';
    try {
        const session = await auth();
        const user = session?.user;

        if (!user) {
            return { error: 'You must be logged in to delete a product.' };
        }

        const products = readProducts();
        const productIndex = products.findIndex(p => p.id === productId);

        if (productIndex === -1) {
            return { error: 'Product not found.' };
        }

        const productToDelete = products[productIndex];

        // Check if the user is the owner of the product or an admin/owner of the site
        if (user.role !== 'owner' && user.role !== 'admin' && productToDelete.artisanId !== user.id) {
            return { error: 'You do not have permission to delete this product.' };
        }

        products.splice(productIndex, 1);
        writeProducts(products);

        revalidatePath('/dashboard');
        revalidatePath('/products');

        return { success: true };

    } catch (error: any) {
        console.error("Error deleting product:", error);
        return { error: error.message || 'An unexpected error occurred.' };
    }
};
