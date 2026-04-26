'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Star } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const buyMutation = useMutation({
    mutationFn: async () => {
      // 1. Crear orden
      const orderRes = await api.post('/orders', {
        productIds: [product!.id],
      });
      const orderId = orderRes.data.data.id;

      // 2. Crear sesión de pago
      const checkoutRes = await api.post(`/payments/checkout/${orderId}`);
      return checkoutRes.data.data.url;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: () => {
      toast.error('Error al procesar la compra');
    },
  });

  const handleBuy = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    buyMutation.mutate();
  };

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-muted-foreground">Producto no encontrado</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Preview */}
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          {product.previewUrl ? (
            <Image
              src={product.previewUrl}
              alt={product.title}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <p className="text-muted-foreground">Sin preview</p>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit">
            {product.category.name}
          </Badge>

          <h1 className="text-3xl font-bold">{product.title}</h1>

          <p className="text-muted-foreground">
            por <span className="font-medium">{product.seller.name}</span>
          </p>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">
              {product._count.reviews} reseñas
            </span>
          </div>

          <Separator />

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Tags */}
          {product.tags && (
            <div className="flex flex-wrap gap-2">
              {product.tags.split(',').map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Precio y botón */}
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold">
              ${(product.price / 100).toFixed(2)}
            </span>
            <Button
              size="lg"
              onClick={handleBuy}
              disabled={buyMutation.isPending}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {buyMutation.isPending ? 'Procesando...' : 'Comprar ahora'}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Reseñas</h2>
          <div className="flex flex-col gap-4">
            {product.reviews.map((review: { 
                id: string; 
                rating: number; 
                comment: string | null;
                user: { name: string };
                }) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{review.user.name}</span>
                  <div className="flex">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-muted-foreground text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}