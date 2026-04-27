import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    previewUrl: string | null;
    tags: string;
    seller: {
      name: string;
    };
    category: {
      name: string;
    };
    _count: {
      reviews: number;
    };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden group border-border/50">
        {/* Preview Image */}
        <div className="aspect-video bg-muted relative overflow-hidden">
          {product.previewUrl ? (
            <Image
              src={product.previewUrl}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm bg-gradient-to-br from-muted to-muted/50">
              Sin preview
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>

        <CardContent className="p-4">
          <Badge variant="secondary" className="mb-2 text-xs bg-primary/10 text-primary border-primary/20">
            {product.category?.name ?? 'Sin categoría'}
          </Badge>

          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          <p className="text-xs text-muted-foreground">
            por {product.seller?.name ?? 'Desconocido'}
          </p>

          {product.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.split(',').slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="font-bold text-lg text-primary">
            ${(product.price / 100).toFixed(2)}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{product._count?.reviews ?? 0}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}