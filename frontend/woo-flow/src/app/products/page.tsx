"use client";

import { useState, useEffect } from "react";
import { ProductStats } from "@/components/products/product-stats";
import { ProductUtilities } from "@/components/products/product-actions";
import { ProductTable } from "@/components/products/product-table";

// Define the Product interface
interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  status: string;
}

export default function ProductsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    categories: 0,
  });

  // Dummy function to load products from API
  const loadProducts = async () => {
    setIsLoading(true);
    
    // Using dummy data for now
    setTimeout(() => {
      const dummyProducts = Array(10).fill(0).map((_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        sku: `SKU-${1000 + i}`,
        price: `$${(Math.random() * 100).toFixed(2)}`,
        stock: Math.floor(Math.random() * 50),
        category: ['Clothing', 'Electronics', 'Home', 'Books'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.2 ? 'Published' : 'Draft'
      }));
      
      setProducts(dummyProducts);
      
      // Calculate stats from products
      setStats({
        totalProducts: dummyProducts.length,
        inStock: dummyProducts.filter(p => p.stock > 0).length,
        outOfStock: dummyProducts.filter(p => p.stock === 0).length,
        categories: new Set(dummyProducts.map(p => p.category)).size
      });
      
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>
      
      <ProductStats stats={stats} isLoading={isLoading} />
      
      <ProductUtilities />
      
      <ProductTable 
        products={products} 
        isLoading={isLoading}
        onRefresh={loadProducts}
      />
    </div>
  );
}

