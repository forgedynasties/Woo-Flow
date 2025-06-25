"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "./stats-card";
import { getProductCount, getCategoryCount } from "@/services/product-service";

export function StatsOverview() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [categoryCount, setCategoryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getCounts() {
      setLoading(true);
      try {
        const [prod, cat] = await Promise.all([
          getProductCount(),
          getCategoryCount()
        ]);
        setProductCount(prod);
        setCategoryCount(cat);
      } catch (e) {
        setProductCount(null);
        setCategoryCount(null);
      } finally {
        setLoading(false);
      }
    }
    getCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        title="Total Products"
        value={loading ? "..." : productCount !== null ? productCount.toString() : "-"}
        icon="inventory_2"
        trend="+12%"
        trendUp={true}
      />
      <StatsCard 
        title="Categories"
        value={loading ? "..." : categoryCount !== null ? categoryCount.toString() : "-"}
        icon="category"
        trend="+3"
        trendUp={true}
      />
    </div>
  );
}
