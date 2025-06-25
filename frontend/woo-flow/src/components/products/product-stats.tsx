"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface ProductStatsProps {
  stats: {
    totalProducts: number;
    inStock: number;
    outOfStock: number;
    categories: number;
  };
  isLoading: boolean;
}

export function ProductStats({ stats, isLoading }: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total Products" 
        value={stats.totalProducts} 
        icon="inventory_2"
        color="bg-blue-100 text-blue-600" 
        isLoading={isLoading}
      />
      <StatCard 
        title="In Stock" 
        value={stats.inStock} 
        icon="check_circle"
        color="bg-green-100 text-green-600" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Out of Stock" 
        value={stats.outOfStock} 
        icon="error"
        color="bg-red-100 text-red-600" 
        isLoading={isLoading}
      />
      <StatCard 
        title="Categories" 
        value={stats.categories} 
        icon="category"
        color="bg-purple-100 text-purple-600" 
        isLoading={isLoading}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
  isLoading: boolean;
}

function StatCard({ title, value, icon, color, isLoading }: StatCardProps) {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mt-1" />
        ) : (
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        )}
      </div>
      <div className={`p-2 rounded-full ${color}`}>
        <span className="material-icons">{icon}</span>
      </div>
    </div>
  );
}
