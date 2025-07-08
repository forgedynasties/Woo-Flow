"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/products/product-form";

export default function AddProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSubmit = async (productData: any) => {
    setIsSaving(true);
    
    try {
      // In a real implementation, you would send the data to your API
      // await fetch('/api/products', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(productData),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Product created successfully!');
      
      // Redirect back to products page
      router.push('/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Failed to create product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <button
          className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80 flex items-center"
          onClick={() => router.push('/products')}
        >
          <span className="material-icons text-sm mr-2">arrow_back</span>
          Back to Products
        </button>
      </div>
      
      <ProductForm 
        onSubmit={handleSubmit}
        isSaving={isSaving}
      />
    </div>
  );
}
