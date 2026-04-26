import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  previewUrl: string | null;
  tags: string;
  status: string;
  seller: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    reviews: number;
  };
  reviews?: {
    id: string;
    rating: number;
    comment: string | null;
    user: {
      id: string;
      name: string;
      avatar: string | null;
    };
  }[];
}

interface QueryParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export function useProducts(params: QueryParams = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const response = await api.get('/products', { params });
      return (response.data.data as Product[]) ?? [];
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const response = await api.get<{ data: Product }>(`/products/${slug}`);
      return response.data.data;
    },
    enabled: !!slug,
  });
}