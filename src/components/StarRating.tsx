import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  maxRating?: number;
  className?: string;
  size?: number;
};

export function StarRating({ rating, maxRating = 5, className, size = 16 }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = maxRating - fullStars - (halfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="hsl(var(--primary))" strokeWidth={0} style={{ width: size, height: size }} />
      ))}
      {halfStar && (
        <div style={{ position: 'relative', width: size, height: size }}>
          <Star style={{ width: size, height: size }} fill="hsl(var(--muted))" strokeWidth={0} />
          <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '100%', overflow: 'hidden' }}>
            <Star style={{ width: size, height: size }} fill="hsl(var(--primary))" strokeWidth={0} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="hsl(var(--muted))" strokeWidth={0} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}
