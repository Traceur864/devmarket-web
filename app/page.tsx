'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');

  const { data, isLoading } = useProducts({ search: query });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <section className="text-center py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-primary/20">
            ✨ La tienda para developers
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Recursos digitales para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
              developers
            </span>
          </h1>
          <p className="text-muted-foreground text-xl mb-10 max-w-lg mx-auto">
            Templates, UI Kits, cursos y más para acelerar tu desarrollo
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar templates, UI kits, cursos..."
              className="flex-1 h-12"
            />
            <Button type="submit" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Catálogo */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          {query ? `Resultados para "${query}"` : 'Productos destacados'}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No se encontraron productos
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}