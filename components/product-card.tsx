import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

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
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        {/* Preview Image */}
        <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
          {product.previewUrl ? (
            <Image
              src={product.previewUrl}
              alt={product.title}
              fill
              loading='eager'
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              Sin preview
            </div>
          )}
        </div>

        <CardContent className="p-4">
          {/* Categoria */}
          <Badge variant="secondary" className="mb-2 text-xs">
            {product.category?.name ?? 'Sin categoría'}
          </Badge>

          {/* Titulo */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-1">
            {product.title}
          </h3>

          {/* Seller */}
          <p className="text-xs text-muted-foreground">
            por {product.seller?.name ?? 'Desconocido'}
          </p>

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.tags.split(',').slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {/* Precio */}
          <span className="font-bold text-lg">
            ${(product.price / 100).toFixed(2)}
          </span>

          {/* Reviews */}
          <span className="text-xs text-muted-foreground">
            {product._count?.reviews ?? 0} reseñas
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}