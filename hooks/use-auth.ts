import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { toast } from 'sonner';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      avatar: string | null;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export function useAuth() {
  const router = useRouter();
  const { setAuth, clearAuth } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) =>
      api.post<AuthResponse>('/auth/register', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`¡Bienvenido ${user.name}!`);
      router.push('/');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Error al registrarse');
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) =>
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (response) => {
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`¡Bienvenido de nuevo, ${user.name}!`);
      router.push('/');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Credenciales incorrectas');
    },
  });

  const logout = () => {
    clearAuth();
    router.push('/login');
    toast.success('Sesión cerrada correctamente');
  };

  return {
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout,
  };
}