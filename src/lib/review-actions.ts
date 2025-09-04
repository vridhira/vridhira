
'use server';

import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Review } from './types';

// This is a placeholder for where reviews would be stored.
// In a real app, this would be a database.
const reviewsFilePath = path.join(process.cwd(), 'src', 'lib', 'reviews.json');


const readReviews = (): Review[] => {
  try {
    if (!fs.existsSync(reviewsFilePath)) {
      // If the file doesn't exist, create it with the initial data from data.ts
       const initialReviews: Review[] = [
        { id: 'rev-1', productId: '1', author: 'Jane D.', rating: 5, comment: 'Absolutely stunning vase! The colors are so vibrant and it looks even better in person.', date: '2023-05-15' },
        { id: 'rev-2', productId: '1', author: 'Mike S.', rating: 4, comment: 'Great quality and beautiful design. A bit smaller than I expected, but still lovely.', date: '2023-06-02' },
        { id: 'rev-3', productId: '2', author: 'Priya K.', rating: 5, comment: 'The scarf is so soft and the block print is perfect. I get so many compliments!', date: '2023-04-20' },
      ];
      fs.writeFileSync(reviewsFilePath, JSON.stringify(initialReviews, null, 2));
      return initialReviews;
    }
    const data = fs.readFileSync(reviewsFilePath, 'utf8');
    return JSON.parse(data) as Review[];
  } catch (error) {
    console.error("Error reading reviews file:", error);
    return [];
  }
};

const writeReviews = (reviews: Review[]) => {
  try {
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
  } catch (error) {
    console.error("Error writing reviews file:", error);
  }
};

type AddReviewData = {
  productId: string;
  author: string;
  rating: number;
  comment: string;
};

export const addReview = async (data: AddReviewData) => {
  try {
    const reviews = readReviews();
    const newReview: Review = {
      id: `rev_${Date.now()}`,
      ...data,
      date: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    writeReviews(reviews);

    revalidatePath(`/products/${data.productId}`);
    revalidatePath('/account');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
