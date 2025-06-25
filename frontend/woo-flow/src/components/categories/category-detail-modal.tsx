"use client";

import { FC } from "react";

interface Category {
  id: number;
  name: string;
  parent: number;
  count: number;
  // Add other fields from your model like slug, description, etc.
  slug?: string;
  description?: string;
}

interface CategoryDetailModalProps {
  category: Category | null;
  onClose: () => void;
}

export const CategoryDetailModal: FC<CategoryDetailModalProps> = ({ category, onClose }) => {
  if (!category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{category.name}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Details */}
        <div className="space-y-4 mb-6">
          <DetailRow label="ID" value={category.id} />
          <DetailRow label="Slug" value={category.slug || 'N/A'} />
          <DetailRow label="Product Count" value={category.count} />
          <DetailRow label="Parent ID" value={category.parent || 'None'} />
          <DetailRow label="Description" value={category.description || 'No description.'} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1">
            <span className="material-icons text-base">delete</span>
            Delete
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1">
            <span className="material-icons text-base">visibility</span>
            View Products
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1">
            <span className="material-icons text-base">edit</span>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between border-b border-zinc-200 pb-2">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm">{value}</span>
  </div>
); 