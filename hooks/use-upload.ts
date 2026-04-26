import { useState } from 'react';
import { api } from '@/lib/axios';
import { toast } from 'sonner';

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data as string;
    } catch {
      toast.error('Error al subir la imagen');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/uploads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data as string;
    } catch {
      toast.error('Error al subir el archivo');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadImage, uploadFile, isUploading };
}