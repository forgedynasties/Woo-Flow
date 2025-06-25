"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  images: any[];
  onChange: (images: any[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // In a real implementation, you would upload these files to your server/CDN
    // Here we'll just create object URLs as a preview
    const newImages = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 15),
      src: URL.createObjectURL(file),
      name: file.name,
      alt: file.name.split(".")[0],
      // In a real app, you would store the actual file here to upload later
      file,
    }));

    onChange([...images, ...newImages]);
  }, [images, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".webp"],
    },
  });

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, i) => i !== indexToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="font-medium mb-2">Product Images</h3>
        <p className="text-sm text-muted-foreground">
          Add images to showcase your product. The first image will be used as the
          featured image.
        </p>
      </div>

      {/* Image dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed ${
          isDragActive ? "border-primary" : "border-input"
        } rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors`}
      >
        <input {...getInputProps()} />
        <span className="material-icons text-4xl mb-2 text-muted-foreground">
          cloud_upload
        </span>
        <p className="text-muted-foreground">
          {isDragActive
            ? "Drop the images here"
            : "Drag & drop images here or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Accepted formats: JPG, PNG, WEBP
        </p>
      </div>

      {/* Images preview */}
      {images.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Product Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div key={image.id || index} className="relative group">
                <div className="aspect-square bg-muted/30 rounded-md overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt || "Product image"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-icons text-sm">delete</span>
                </button>
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
