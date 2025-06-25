"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteProduct } from '@/services/product-service';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock: number;
  category: string;
  status: string;
}

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ProductTable({ products, isLoading, onRefresh }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  
  const filteredProducts = products.filter(
    product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id, true);
      onRefresh();
    } catch (e) {
      alert('Failed to delete product.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Products List</h2>
        <div className="flex gap-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <span className="material-icons text-sm">search</span>
            </span>
            <input 
              type="text" 
              placeholder="Search products..." 
              className="pl-10 pr-4 py-2 bg-muted/50 border border-zinc-200 rounded-md w-full max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            className="p-2 bg-muted/50 border border-zinc-200 rounded-md hover:bg-muted"
            onClick={onRefresh}
          >
            <span className="material-icons">refresh</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b border-zinc-200">
              <th className="pb-2 pt-4">Name</th>
              <th className="pb-2 pt-4">SKU</th>
              <th className="pb-2 pt-4">Price</th>
              <th className="pb-2 pt-4">Inventory</th>
              <th className="pb-2 pt-4">Category</th>
              <th className="pb-2 pt-4">Status</th>
              <th className="pb-2 pt-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-zinc-200">
                  <td className="py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="py-4"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))
            ) : filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-zinc-200">
                  <td className="py-4">{product.name}</td>
                  <td className="py-4">{product.sku}</td>
                  <td className="py-4">{product.price}</td>
                  <td className="py-4">{product.stock}</td>
                  <td className="py-4">{product.category}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      product.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-blue-500 hover:text-blue-700">
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      <button 
                        className={`p-1 text-red-500 hover:text-red-700 ${deletingId === product.id ? 'opacity-50 pointer-events-none' : ''}`}
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                      <button className="p-1 text-gray-500 hover:text-gray-700">
                        <span className="material-icons text-sm">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-muted-foreground">
                  {search ? 'No products match your search' : 'No products found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
