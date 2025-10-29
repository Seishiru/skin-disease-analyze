import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  selectedImage: { file: File; previewUrl: string } | null;
}

export function ImageUpload({ onImageSelect, selectedImage }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError('');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onImageSelect(file, previewUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const clearImage = () => {
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage.previewUrl);
    }
    onImageSelect(null as any, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {selectedImage ? (
        <Card className="p-4">
          <div className="relative">
            <img
              src={selectedImage.previewUrl}
              alt="Selected skin condition"
              className="w-full h-32 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            View full image on the left
          </p>
        </Card>
      ) : (
        <Card
          className={`p-6 sm:p-8 border-2 border-dashed transition-colors cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center">
              {isDragging ? (
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              ) : (
                <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg">Upload Skin Condition Image</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Supports JPG, PNG, GIF up to 10MB
              </p>
            </div>
          </div>
        </Card>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}