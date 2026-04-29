'use client';

import Image from 'next/image';
import { api } from '@/lib/axios';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useProduct } from '@/hooks/use-products';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Star } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const reviewForm = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 5, comment: '' },
  });

  const buyMutation = useMutation({
    mutationFn: async () => {
      const orderRes = await api.post('/orders', {
        productIds: [product!.id],
      });
      const orderId = orderRes.data.data.id;
      const checkoutRes = await api.post(`/payments/checkout/${orderId}`);
      return checkoutRes.data.data.url;
    },
    onSuccess: (url: string) => {
      window.location.href = url;
    },
    onError: (error: AxiosError<{message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Error al procesar la compra');
    },
  });

  const reviewMutation = useMutation({
    mutationFn: (data: ReviewForm) =>
      api.post('/reviews', { ...data, productId: product?.id }),
    onSuccess: () => {
      toast.success('Reseña publicada correctamente');
      reviewForm.reset();
      void queryClient.invalidateQueries({ queryKey: ['product', slug] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Error al publicar la reseña');
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
      <div className="aspect-video bg-muted rounded-2xl overflow-hidden relative">
        {product.previewUrl ? (
          <Image
            src={product.previewUrl}
            alt={product.title}
            width={800}
            height={450}
            loading="eager"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <p className="text-muted-foreground">Sin preview</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <Badge variant="secondary" className="w-fit bg-primary/10 text-primary border-primary/20">
          {product.category.name}
        </Badge>

        <h1 className="text-3xl font-bold">{product.title}</h1>

        <p className="text-muted-foreground">
          por <span className="font-medium text-foreground">{product.seller.name}</span>
        </p>

        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {product._count.reviews} reseñas
          </span>
        </div>

        <Separator />

        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        {product.tags && (
          <div className="flex flex-wrap gap-2">
            {product.tags.split(',').map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.trim()}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Precio y botón */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Precio</p>
            <span className="text-4xl font-bold text-primary">
              ${(product.price / 100).toFixed(2)}
            </span>
          </div>
          <Button
            size="lg"
            onClick={handleBuy}
            disabled={buyMutation.isPending}
            className="h-12 px-8"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.reviews.map((review: {
            id: string;
            rating: number;
            comment: string | null;
            user: { name: string };
          }) => (
            <div key={review.id} className="border border-border/50 rounded-xl p-4 bg-card">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm">{review.user.name}</span>
                <div className="flex ml-auto">
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

    {/* Formulario de reseña */}
    {isAuthenticated() && (
      <section className="mt-8 border border-border/50 rounded-2xl p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4">Dejar una reseña</h3>
        <form onSubmit={reviewForm.handleSubmit((data) => reviewMutation.mutate(data))}>
          <FieldGroup>
            <Controller
              name="rating"
              control={reviewForm.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Rating</FieldLabel>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                      >
                        <Star className={`w-7 h-7 transition-colors ${
                          star <= field.value
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground hover:text-yellow-400'
                        }`} />
                      </button>
                    ))}
                  </div>
                </Field>
              )}
            />
            <Controller
              name="comment"
              control={reviewForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Comentario (opcional)</FieldLabel>
                  <textarea
                    {...field}
                    rows={3}
                    placeholder="¿Qué te pareció el producto?"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" className="mt-4" disabled={reviewMutation.isPending}>
            {reviewMutation.isPending ? 'Publicando...' : 'Publicar reseña'}
          </Button>
        </form>
      </section>
    )}
  </main>
);
}