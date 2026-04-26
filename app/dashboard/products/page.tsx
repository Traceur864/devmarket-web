'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  createdAt: string;
  category: { name: string };
  _count: { reviews: number; orderItems: number };
}

const statusColors: Record<string, string> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ARCHIVED: 'outline',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

export default function MyProductsPage() {
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const response = await api.get('/products/my-products');
      return response.data.data as Product[];
    },
  });

  const publishMutation = useMutation({
    mutationFn: (slug: string) => api.patch(`/products/${slug}/publish`),
    onSuccess: () => {
      toast.success('Producto publicado correctamente');
      void queryClient.invalidateQueries({ queryKey: ['my-products'] });
    },
    onError: () => {
      toast.error('Error al publicar el producto');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No tienes productos aún</h2>
        <p className="text-muted-foreground">
          Crea tu primer producto digital y empieza a vender
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis productos</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">
            <Plus className="w-4 h-4 mr-2" />
            Crear producto
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">{product.title}</CardTitle>
              <Badge variant={statusColors[product.status] as 'secondary' | 'default' | 'outline'}>
                {statusLabels[product.status]}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span>{product.category.name}</span>
                  <span>${(product.price / 100).toFixed(2)}</span>
                  <span>{product._count.orderItems} ventas</span>
                  <span>{product._count.reviews} reseñas</span>
                </div>
                {product.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => publishMutation.mutate(product.slug)}
                    disabled={publishMutation.isPending}
                  >
                    Publicar
                  </Button>
                )}
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/dashboard/products/${product.slug}/edit`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}