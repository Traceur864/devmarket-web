'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  previewUrl: string | null;
  tags: string;
  seller: { id: string; name: string; avatar: string | null };
  category: { id: string; name: string; slug: string };
  _count: { reviews: number };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      const response = await api.get('/search', { params: { search: query } });
      return response.data.data as Product[];
    },
    enabled: !!query,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Buscar productos</h1>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-8">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar templates, UI kits, cursos..."
          className="flex-1"
        />
        <Button type="submit">
          <Search className="w-4 h-4 mr-2" />
          Buscar
        </Button>
      </form>

      {!query ? (
        <p className="text-muted-foreground">Escribe algo para buscar</p>
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-72 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-muted-foreground">
            No se encontraron resultados para &quot;{query}&quot;
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}