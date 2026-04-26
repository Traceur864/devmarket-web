'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    id: string;
    price: number;
    product: {
      id: string;
      title: string;
      slug: string;
      previewUrl: string | null;
    };
  }[];
}

const statusColors: Record<string, string> = {
  PENDING: 'secondary',
  PAID: 'default',
  FAILED: 'destructive',
  REFUNDED: 'outline',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
};

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data.data as Order[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">No tienes compras aún</h2>
        <p className="text-muted-foreground">
          Explora el catálogo y encuentra recursos digitales para tu próximo proyecto
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mis compras</h1>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-mono text-muted-foreground">
                #{order.id.slice(0, 8)}
              </CardTitle>
              <Badge variant={statusColors[order.status] as 'secondary' | 'default' | 'destructive' | 'outline'}>
                {statusLabels[order.status]}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span className="text-sm">{item.product.title}</span>
                    <span className="text-sm font-medium">
                      ${(item.price / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}