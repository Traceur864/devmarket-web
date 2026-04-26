'use client';

import { useState, useEffect} from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useUpload } from '@/hooks/use-upload';
import { useCategories } from '@/hooks/use-categories';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { AxiosError } from 'axios';

const productSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  categoryId: z.string().uuid('Selecciona una categoría'),
  tags: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  previewUrl: string | null;
  fileUrl: string | null;
  tags: string | null;
  categoryId: string;
}

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { uploadImage, uploadFile, isUploading } = useUpload();
  const { data: categories } = useCategories();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product-edit', slug],
    queryFn: async () => {
      const response = await api.get(`/products/${slug}`);
      return response.data.data as Product;
    },
  });

  const form = useForm<ProductForm>({
  resolver: zodResolver(productSchema),
  defaultValues: {
    title: '',
    slug: '',
    description: '',
    price: 0,
    categoryId: '',
    tags: '',
  },
});

useEffect(() => {
  if (product) {
    form.reset({
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price / 100,
      categoryId: product.categoryId,
      tags: product.tags ?? '',
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (product.previewUrl) setPreviewUrl(product.previewUrl);
    if (product.fileUrl) setFileUrl(product.fileUrl);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file);
    if (url) setPreviewUrl(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      setFileUrl(url);
      toast.success('Archivo subido correctamente');
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: ProductForm) =>
      api.patch(`/products/${slug}`, {
        ...data,
        price: Math.round(data.price * 100),
        previewUrl,
        fileUrl,
      }),
    onSuccess: () => {
      toast.success('Producto actualizado correctamente');
      router.push('/dashboard/products');
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? 'Error al actualizar el producto');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar producto</h1>

      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))}>
        <div className="flex flex-col gap-6 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información básica</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Título</FieldLabel>
                      <Input {...field} placeholder="Dashboard UI Kit para React" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="slug"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Slug</FieldLabel>
                      <Input {...field} placeholder="dashboard-ui-kit-react" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Descripción</FieldLabel>
                      <textarea
                        {...field}
                        rows={4}
                        placeholder="Describe tu producto..."
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Categoría</FieldLabel>
                      <select
                        {...field}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Precio (USD)</FieldLabel>
                      <div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="9.99"
                          value={field.value === 0 ? '' : field.value}
                          onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="tags"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Tags (separados por comas)</FieldLabel>
                      <Input {...field} placeholder="react,tailwind,dashboard" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagen de preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={previewUrl} alt="Preview" fill loading='eager' className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(null)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Subir imagen de preview</span>
                  <span className="text-xs text-muted-foreground mt-1">JPG, PNG o WebP — máx 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Archivo digital</CardTitle>
            </CardHeader>
            <CardContent>
              {fileUrl ? (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground truncate">
                    {fileUrl.split('/').pop()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFileUrl(null)}
                    className="text-destructive ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Subir archivo digital</span>
                  <span className="text-xs text-muted-foreground">Máx 100MB</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" disabled={updateMutation.isPending || isUploading}>
              {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/products')}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}