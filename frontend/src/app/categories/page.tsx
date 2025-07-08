"use client";

import { useState, useEffect } from "react";
import { CategoryStats } from "@/components/categories/category-stats";
import { CategoryActions } from "@/components/categories/category-actions";
import { CategoryTree } from "@/components/categories/category-tree";
import { fetchCategories, Category } from '@/services/category-service';
import { CategoryDistribution } from '@/components/dashboard/category-distribution';

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    topLevelCategories: 0,
    totalProducts: 0,
  });

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const apiCategories = await fetchCategories();
      setCategories(apiCategories);
      setStats({
        totalCategories: apiCategories.length,
        topLevelCategories: apiCategories.filter(c => c.parent === 0).length,
        totalProducts: apiCategories.reduce((acc, c) => acc + (c.count || 0), 0),
      });
    } catch (e) {
      setCategories([]);
      setStats({ totalCategories: 0, topLevelCategories: 0, totalProducts: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <CategoryStats stats={stats} isLoading={isLoading} />
      <CategoryDistribution />
      <CategoryActions onRefresh={loadCategories} />
      <CategoryTree categories={categories} isLoading={isLoading} onUpdate={loadCategories} />
    </div>
  );
} 