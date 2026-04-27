'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Moon, Sun, ShoppingBag, Package, User } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-bold text-xl">
          Dev<span className="text-primary">Market</span>
        </Link>

        {/* Links del centro */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Catálogo
          </Link>
          <Link href="/search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Buscar
          </Link>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2">
          {/* Toggle dark/light */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="relative"
          >
            <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {isAuthenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  {user?.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Mi cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/orders">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Mis compras
                  </Link>
                </DropdownMenuItem>
                {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/products">
                    <Package className="w-4 h-4 mr-2" />
                    Mis productos</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Registrarse</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}