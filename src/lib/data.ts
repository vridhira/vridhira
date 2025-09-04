

import { Review, Order } from './types';

// --- MOCK DATA --- //
// In a real application, this data would be fetched from a database or API.

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  artisanId: string;
};

export type Category = {
  name:string;
  image: string;
  data_ai_hint: string;
};

export type Artisan = {
  id: string;
  name: string;
  location: string;
  bio: string;
  profileImage: string;
};


export const products: Product[] = [
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

export const categories: Category[] = [
  { name: 'Textiles', image: 'https://picsum.photos/400/300?category=textiles', data_ai_hint: 'fabric textiles' },
  { name: 'Pottery', image: 'https://picsum.photos/400/300?category=pottery', data_ai_hint: 'clay pottery' },
  { name: 'Woodwork', image: 'https://picsum.photos/400/300?category=woodwork', data_ai_hint: 'wood carving' },
  { name: 'Jewelry', image: 'https://picsum.photos/400/300?category=jewelry', data_ai_hint: 'handmade jewelry' },
  { name: 'Paintings', image: 'https://picsum.photos/400/300?category=paintings', data_ai_hint: 'folk art' },
];

export const artisans: Artisan[] = [
  {
    id: 'artisan-1',
    name: 'Ramesh Kumar',
    location: 'Jaipur, Rajasthan',
    bio: 'Ramesh is a master potter with over 20 years of experience. He learned the craft from his father and specializes in the famous blue pottery of Jaipur, a technique that uses a unique quartz-based clay.',
    profileImage: 'https://picsum.photos/200/200?artisan=1',
  },
  {
    id: 'artisan-2',
    name: 'Sita Devi',
    location: 'Bhuj, Gujarat',
    bio: 'Sita is a textile artist from the Kutch region, known for her intricate embroidery and block-printing. She leads a cooperative of women artisans, empowering them to earn a livelihood through their traditional skills.',
    profileImage: 'https://picsum.photos/200/200?artisan=2',
  },
    {
    id: 'artisan-3',
    name: 'Karthik Reddy',
    location: 'Channapatna, Karnataka',
    bio: 'Karthik is a third-generation woodworker from Channapatna, a town famous for its lacquered wooden toys. He uses traditional techniques and natural dyes to create beautiful, safe, and sustainable wooden crafts.',
    profileImage: 'https://picsum.photos/200/200?artisan=3',
  },
];

export const reviews: Review[] = [
    { id: 'rev-1', productId: '1', author: 'Jane D.', rating: 5, comment: 'Absolutely stunning vase! The colors are so vibrant and it looks even better in person.', date: '2023-05-15' },
    { id: 'rev-2', productId: '1', author: 'Mike S.', rating: 4, comment: 'Great quality and beautiful design. A bit smaller than I expected, but still lovely.', date: '2023-06-02' },
    { id: 'rev-3', productId: '2', author: 'Priya K.', rating: 5, comment: 'The scarf is so soft and the block print is perfect. I get so many compliments!', date: '2023-04-20' },
];

const orders: Order[] = [
    {
        id: 'ORD-001',
        userId: '1756721694952', // alok singh
        date: '2023-10-26',
        status: 'Delivered',
        total: 70.00,
        items: [
            { productId: '1', name: 'Hand-Painted Ceramic Vase', quantity: 1, price: 45.00 },
            { productId: '2', name: 'Block-Printed Cotton Scarf', quantity: 1, price: 25.00 },
        ],
    },
    {
        id: 'ORD-002',
        userId: '1756721694952', // alok singh
        date: '2023-11-05',
        status: 'Shipped',
        total: 90.00,
        items: [
            { productId: '3', name: 'Carved Rosewood Elephant', quantity: 1, price: 75.00 },
            { productId: '4', name: 'Terracotta Diyas (Set of 4)', quantity: 1, price: 15.00 },
        ],
    },
    {
        id: 'ORD-003',
        userId: '101326878748707276296', // Himanshu Shroff
        date: '2023-11-12',
        status: 'Processing',
        total: 35.00,
        items: [
            { productId: '5', name: 'Embroidered Cushion Cover', quantity: 1, price: 35.00 },
        ],
    },
    {
        id: 'ORD-004',
        userId: '101326878748707276296', // Himanshu Shroff
        date: '2023-11-15',
        status: 'Cancelled',
        total: 60.00,
        items: [
            { productId: '6', name: 'Handmade Wooden Spice Box', quantity: 1, price: 60.00 },
        ],
    }
];

// In a real app, this would fetch from a database
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
    // This is a mock implementation. It filters orders based on the userId.
    const userOrders = orders.filter(order => order.userId === userId);
    return Promise.resolve(userOrders);
}

export async function getProductsByArtisan(artisanId: string): Promise<Product[]> {
    const artisanProducts = products.filter(p => p.artisanId === artisanId);
    return Promise.resolve(artisanProducts);
}
