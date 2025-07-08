"use client";

import { useState, useEffect } from "react";
import { ProductStats } from "@/components/products/product-stats";
import { ProductUtilities } from "@/components/products/product-actions";
import { ProductTable } from "@/components/products/product-table";
import { fetchProducts, Product as ApiProduct } from '@/services/product-service';

// Define the Product interface for the component
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
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    outOfStock: 0,
    categories: 0,
  });

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedProducts = await fetchProducts();
      
      // Map API products to the format expected by the ProductTable component
      const mappedProducts: Product[] = fetchedProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku || '',
        price: product.regular_price || product.price || '',
        stock: product.stock_quantity || 0,
        category: product.categories?.length ? product.categories[0].name : '',
        status: product.status || 'publish'
      }));
      
      setProducts(mappedProducts);
      
      // Calculate stats from products
      const categorySet = new Set(fetchedProducts.flatMap(p => 
        p.categories?.map(c => c.name) || []
      ));
      
      setStats({
        totalProducts: fetchedProducts.length,
        inStock: fetchedProducts.filter(p => p.stock_status === 'instock').length,
        outOfStock: fetchedProducts.filter(p => p.stock_status !== 'instock').length,
        categories: categorySet.size
      });
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
      // Set empty products on error
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
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
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <div className="flex items-center">
            <span className="material-icons mr-2">error</span>
            <p>{error}</p>
          </div>
          <p className="mt-2 text-sm">
            Make sure your API server is running and properly configured in the settings.
          </p>
          <button 
            onClick={loadProducts} 
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded flex items-center"
          >
            <span className="material-icons text-sm mr-1">refresh</span>
            Retry
          </button>
        </div>
      )}
      
      <ProductTable 
        products={products} 
        isLoading={isLoading}
        onRefresh={loadProducts}
      />
    </div>
  );
}

