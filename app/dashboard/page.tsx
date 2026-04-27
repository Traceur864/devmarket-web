'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, Star, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders');
      return response.data.data as { id: string; status: string; total: number }[];
    },
  });

  const { data: products } = useQuery({
    queryKey: ['my-products'],
    queryFn: async () => {
      const response = await api.get('/products/my-products');
      return response.data.data as { id: string; _count: { reviews: number; orderItems: number } }[];
    },
  });

  const totalOrders = orders?.filter(o => o.status === 'PAID').length ?? 0;
  const totalProducts = products?.length ?? 0;
  const totalReviews = products?.reduce((acc, p) => acc + p._count.reviews, 0) ?? 0;
  const totalSales = products?.reduce((acc, p) => acc + p._count.orderItems, 0) ?? 0;

  const stats = [
    { label: 'Compras realizadas', value: totalOrders, icon: ShoppingBag, color: 'text-blue-500' },
    { label: 'Mis productos', value: totalProducts, icon: Package, color: 'text-primary' },
    { label: 'Reseñas recibidas', value: totalReviews, icon: Star, color: 'text-yellow-500' },
    { label: 'Ventas totales', value: totalSales, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Bienvenido, {user?.name ?? 'usuario'} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Aquí tienes un resumen de tu actividad
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}