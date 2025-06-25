"use client";

import { StatsCard } from "./stats-card";

export function StatsOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard 
        title="Total Products"
        value="128"
        icon="inventory_2"
        trend="+12%"
        trendUp={true}
      />
      <StatsCard 
        title="Categories"
        value="24"
        icon="category"
        trend="+3"
        trendUp={true}
      />
      <StatsCard 
        title="Total Orders"
        value="432"
        icon="shopping_cart"
        trend="+8%"
        trendUp={true}
      />
      <StatsCard 
        title="Revenue"
        value="$12,584"
        icon="payments"
        trend="+18%"
        trendUp={true}
      />
    </div>
  );
}
