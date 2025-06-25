"use client";

import { useState, useEffect, FC } from "react";
import { CategoryStats } from "@/components/categories/category-stats";
import { CategoryActions } from "@/components/categories/category-actions";
import { CategoryTree } from "@/components/categories/category-tree";

// Define the Category interface
interface Category {
  id: number;
  name: string;
  parent: number;
  count: number;
}

// Dummy data for categories with deeper nesting
const dummyCategories: Category[] = [
  { id: 1, name: "Electronics", parent: 0, count: 200 },
  { id: 2, name: "Computers", parent: 1, count: 100 },
  { id: 3, name: "Laptops", parent: 2, count: 60 },
  { id: 4, name: "Desktops", parent: 2, count: 40 },
  { id: 5, name: "Gaming Laptops", parent: 3, count: 25 },
  { id: 6, name: "Mobile Phones", parent: 1, count: 80 },
  { id: 7, name: "Smartphones", parent: 6, count: 70 },
  { id: 8, name: "Accessories", parent: 6, count: 10 },
  { id: 9, name: "Fashion", parent: 0, count: 150 },
  { id: 10, name: "Men's", parent: 9, count: 75 },
  { id: 11, name: "Shirts", parent: 10, count: 40 },
  { id: 12, name: "Women's", parent: 9, count: 75 },
];

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
    setTimeout(() => {
      setCategories(dummyCategories);
      setStats({
        totalCategories: dummyCategories.length,
        topLevelCategories: dummyCategories.filter(c => c.parent === 0).length,
        totalProducts: dummyCategories.reduce((acc, c) => acc + c.count, 0),
      });
      setIsLoading(false);
    }, 1000);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Categories</h1>
      <CategoryStats stats={stats} isLoading={isLoading} />
      <CategoryActions onRefresh={loadCategories} />
      <CategoryTree categories={categories} isLoading={isLoading} />
    </div>
  );
} 