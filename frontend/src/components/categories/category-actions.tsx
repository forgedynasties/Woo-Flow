"use client";

import { FC } from "react";

interface CategoryActionsProps {
  onRefresh: () => void;
}

export const CategoryActions: FC<CategoryActionsProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-end gap-2">
      <button 
        onClick={onRefresh} 
        className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80 flex items-center gap-2"
      >
        <span className="material-icons text-base">refresh</span>
        Refresh
      </button>
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center gap-2">
        <span className="material-icons text-base">add_circle</span>
        Add Category
      </button>
    </div>
  );
}; 