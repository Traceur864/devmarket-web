'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
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

const productSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  price: z.number().min(1, 'El precio debe ser mayor a 0'),
  categoryId: z.string().uuid('Selecciona una categoría'),
  tags: z.string().optional(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function NewProductPage() {
  const router = useRouter();
  const { uploadImage, uploadFile, isUploading } = useUpload();
  const { data: categories } = useCategories();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

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

  // Generar slug automáticamente desde el título
  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    form.setValue('slug', slug);
  };

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

  const createMutation = useMutation({
    mutationFn: (data: ProductForm) =>
      api.post('/products', {
        ...data,
        price: Math.round(data.price * 100), // convertir a centavos
        previewUrl,
        fileUrl,
      }),
    onSuccess: () => {
      toast.success('Producto creado correctamente');
      router.push('/dashboard/products');
    },
    onError: () => {
      toast.error('Error al crear el producto');
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Crear producto</h1>

      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}>
        <div className="flex flex-col gap-6 max-w-2xl">

          {/* Info básica */}
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
                      <Input
                        {...field}
                        placeholder="Dashboard UI Kit para React"
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e.target.value);
                        }}
                      />
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

          {/* Preview image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagen de preview</CardTitle>
            </CardHeader>
            <CardContent>
              {previewUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
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
                  <span className="text-sm text-muted-foreground">
                    Subir imagen de preview
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    JPG, PNG o WebP — máx 5MB
                  </span>
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

          {/* Archivo digital */}
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
                  <span className="text-sm text-muted-foreground">
                    Subir archivo digital
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Máx 100MB
                  </span>
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
            <Button
              type="submit"
              disabled={createMutation.isPending || isUploading}
            >
              {createMutation.isPending ? 'Creando...' : 'Crear producto'}
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