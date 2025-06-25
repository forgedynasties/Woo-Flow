"use client";

import { useState, FC } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Stat {
  name: string;
  value: number;
  icon: string;
}

interface CategoryStatsProps {
  stats: {
    totalCategories: number;
    topLevelCategories: number;
    totalProducts: number;
  };
  isLoading: boolean;
}

export const CategoryStats: FC<CategoryStatsProps> = ({ stats, isLoading }) => {
  const statItems: Stat[] = [
    { name: "Total Categories", value: stats.totalCategories, icon: "category" },
    { name: "Total Products", value: stats.totalProducts, icon: "inventory" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {statItems.map((item) => (
        <div key={item.name} className="bg-card p-6 rounded-lg shadow-sm flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <span className="material-icons text-primary text-2xl">{item.icon}</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{item.name}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{item.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}; 