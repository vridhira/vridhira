export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  artisanId: string;
  rating: number;
  reviewCount: number;
};

export type Artisan = {
  id: string;
  name: string;
  bio: string;
  profileImage: string;
  location: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export const artisans: Artisan[] = [
  {
    id: 'artisan-1',
    name: 'Meera Sharma',
    bio: 'A passionate weaver from Rajasthan, Meera has been creating intricate tapestries for over 20 years. Her work is inspired by the vibrant colors of her homeland.',
    profileImage: 'https://picsum.photos/200/200?a=1',
    location: 'Jaipur, Rajasthan',
  },
  {
    id: 'artisan-2',
    name: 'Rajesh Kumar',
    bio: 'Rajesh is a master potter from Uttar Pradesh. He inherited the craft from his father and specializes in minimalist designs with a modern twist.',
    profileImage: 'https://picsum.photos/200/200?a=2',
    location: 'Khurja, Uttar Pradesh',
  },
];

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Handwoven Wool Shawl',
    description:
      'A luxurious and warm shawl handwoven from the finest Himalayan wool. Features a traditional geometric pattern in natural dyes. Perfect for chilly evenings.',
    price: 89.99,
    images: ['https://picsum.photos/600/400?p=1', 'https://picsum.photos/600/400?p=2', 'https://picsum.photos/600/400?p=3'],
    category: 'Textiles',
    artisanId: 'artisan-1',
    rating: 4.8,
    reviewCount: 125,
  },
  {
    id: 'prod-2',
    name: 'Terracotta Clay Pot',
    description:
      'A beautifully crafted terracotta pot, perfect for indoor plants or as a decorative piece. Its porous nature helps plants breathe. Hand-thrown and fired in a traditional kiln.',
    price: 24.99,
    images: ['https://picsum.photos/600/400?p=4', 'https://picsum.photos/600/400?p=5'],
    category: 'Pottery',
    artisanId: 'artisan-2',
    rating: 4.9,
    reviewCount: 210,
  },
  {
    id: 'prod-3',
    name: 'Blue Pottery Vase',
    description:
      'An exquisite vase made using the famous Blue Pottery technique of Jaipur. It is lead-free and features a hand-painted floral motif. A statement piece for any home.',
    price: 45.00,
    images: ['https://picsum.photos/600/400?p=6', 'https://picsum.photos/600/400?p=7'],
    category: 'Pottery',
    artisanId: 'artisan-1',
    rating: 4.7,
    reviewCount: 88,
  },
  {
    id: 'prod-4',
    name: 'Embroidered Cushion Cover',
    description:
      'Vibrant cushion cover with traditional "Phulkari" embroidery from Punjab. Made from high-quality cotton, it adds a splash of color and culture to your living space.',
    price: 32.50,
    images: ['https://picsum.photos/600/400?p=8', 'https://picsum.photos/600/400?p=9'],
    category: 'Home Decor',
    artisanId: 'artisan-1',
    rating: 4.6,
    reviewCount: 95,
  },
  {
    id: 'prod-5',
    name: 'Wooden Spice Box',
    description:
      'A hand-carved spice box made from durable Sheesham wood. It has multiple compartments to store your spices and a transparent lid. A must-have for every kitchen.',
    price: 55.00,
    images: ['https://picsum.photos/600/400?p=10'],
    category: 'Woodwork',
    artisanId: 'artisan-2',
    rating: 4.9,
    reviewCount: 150,
  },
   {
    id: 'prod-6',
    name: 'Ceramic Serving Bowl',
    description:
      'Minimalist ceramic serving bowl with a unique glaze. Each piece is handmade, resulting in slight variations that make it one-of-a-kind. Microwave and dishwasher safe.',
    price: 39.99,
    images: ['https://picsum.photos/600/400?p=11'],
    category: 'Pottery',
    artisanId: 'artisan-2',
    rating: 4.8,
    reviewCount: 72,
  },
];

export const reviews: Review[] = [
    {
        id: 'rev-1',
        productId: 'prod-1',
        author: 'Jane D.',
        rating: 5,
        comment: 'Absolutely stunning shawl! The quality is amazing and it is so warm. Worth every penny.',
        date: '2023-10-15',
    },
    {
        id: 'rev-2',
        productId: 'prod-1',
        author: 'Mark S.',
        rating: 4,
        comment: 'Beautiful craftsmanship. A little smaller than I expected, but still love it.',
        date: '2023-10-20',
    },
    {
        id: 'rev-3',
        productId: 'prod-2',
        author: 'Emily R.',
        rating: 5,
        comment: 'This pot is perfect for my succulent collection. It looks so rustic and chic.',
        date: '2023-11-01',
    }
];

export const categories = [
    { name: 'Textiles', image: 'https://picsum.photos/400/300?c=1', data_ai_hint: 'textile fabric' },
    { name: 'Pottery', image: 'https://picsum.photos/400/300?c=2', data_ai_hint: 'pottery clay' },
    { name: 'Home Decor', image: 'https://picsum.photos/400/300?c=3', data_ai_hint: 'home decor' },
    { name: 'Woodwork', image: 'https://picsum.photos/400/300?c=4', data_ai_hint: 'wood craft' },
    { name: 'Jewelry', image: 'https://picsum.photos/400/300?c=5', data_ai_hint: 'jewelry handmade' },
];
