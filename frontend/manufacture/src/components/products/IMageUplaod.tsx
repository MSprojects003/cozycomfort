import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ImagePlus, X, Camera } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  onImageSelect: (file: File | null) => void;
  existingImage?: string | null;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  onImageSelect,
  existingImage,
  aspectRatio = 'square'
}) => {
  const [preview, setPreview] = useState<string | null>(existingImage || null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      default:
        return 'aspect-auto';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          dragActive
            ? 'border-gray-900 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative">
            <div className={`${getAspectRatioClass()} w-full overflow-hidden rounded-lg bg-gray-100`}>
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`${getAspectRatioClass()} flex flex-col items-center justify-center gap-2 cursor-pointer`}
            onClick={() => inputRef.current?.click()}
          >
            <div className="rounded-full bg-gray-100 p-3">
              <Camera className="h-6 w-6 text-gray-600" />
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Click or drag to upload image
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, JPEG up to 5MB
              </p>
            </div>
          </div>
        )}
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
    </div>
  );
};