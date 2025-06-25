"use client";

import { ReactNode } from "react";

export interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  trend: string;
  trendUp: boolean;
}

export function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-primary/10 p-2 rounded-full">
          <span className="material-icons text-primary">{icon}</span>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span className={`flex items-center text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
          <span className="material-icons text-sm mr-1">{trendUp ? 'trending_up' : 'trending_down'}</span>
          {trend}
        </span>
        <span className="text-xs text-muted-foreground ml-2">vs last month</span>
      </div>
    </div>
  );
}
