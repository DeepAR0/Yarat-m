import { Star } from 'lucide-react';

export function StarRating({ stars, label = true }: { stars: number; label?: boolean }) {
  return <span className="star-rating" aria-label={label ? `${stars} / 3 yıldız` : undefined} aria-hidden={!label}>
    {[1, 2, 3].map(i => <Star key={i} size={15} className={i <= stars ? 'earned' : ''} fill={i <= stars ? 'currentColor' : 'none'} />)}
  </span>;
}

