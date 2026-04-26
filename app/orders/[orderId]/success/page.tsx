'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold mb-2">¡Pago exitoso!</h1>
        <p className="text-muted-foreground mb-2">
          Tu compra fue procesada correctamente.
        </p>
        <p className="text-sm text-muted-foreground mb-8 font-mono">
          Orden: #{orderId?.slice(0, 8)}
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/orders">Ver mis compras</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Seguir comprando</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}