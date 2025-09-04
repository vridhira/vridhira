
'use server';

import fs from 'fs';
import path from 'path';
import { Shop } from './types';

// This is a simple file-based data store for development.
// Replace with a proper database for production.
const shopsFilePath = path.join(process.cwd(), 'src', 'lib', 'shops.json');

const readShops = (): Shop[] => {
  try {
    if (!fs.existsSync(shopsFilePath)) {
      fs.writeFileSync(shopsFilePath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(shopsFilePath, 'utf8');
    return JSON.parse(data) as Shop[];
  } catch (error) {
    console.error("Error reading shops file:", error);
    throw new Error("Could not read shop data.");
  }
};

const writeShops = (shops: Shop[]) => {
  try {
    fs.writeFileSync(shopsFilePath, JSON.stringify(shops, null, 2));
  } catch (error) {
    console.error("Error writing shops file:", error);
    throw new Error("Could not save shop data.");
  }
};

interface CreateShopData {
    ownerId: string;
    shopName: string;
    category: string;
}

export const createShop = async (shopData: CreateShopData): Promise<Shop> => {
  const shops = readShops();
  const existingShop = shops.find(s => s.name.toLowerCase() === shopData.shopName.toLowerCase());
  
  if (existingShop) {
      throw new Error('A shop with this name already exists.');
  }

  const newShop: Shop = {
    id: `shop-${Date.now()}`,
    ownerId: shopData.ownerId,
    name: shopData.shopName,
    category: shopData.category,
    createdAt: new Date().toISOString(),
  };

  shops.push(newShop);
  writeShops(shops);
  
  return newShop;
};

export const getShopByOwnerId = async (ownerId: string): Promise<Shop | undefined> => {
    const shops = readShops();
    return shops.find(shop => shop.ownerId === ownerId);
}
