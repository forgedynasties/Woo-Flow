"use client";

import React, { FC, useState } from "react";
import { deleteCategory, updateCategory, Category } from "@/services/category-service";

interface CategoryDetailModalProps {
  category: Category | null;
  onClose: () => void;
  onUpdate?: () => void;
}

export const CategoryDetailModal: FC<CategoryDetailModalProps> = ({ category, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when category changes
  React.useEffect(() => {
    setName(category?.name || "");
    setDescription(category?.description || "");
    setIsEditing(false);
    setError(null);
  }, [category]);

  if (!category) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete category '${category.name}'?`)) return;
    setLoading(true);
    setError(null);
    try {
      await deleteCategory(category.id);
      onClose();
      onUpdate && onUpdate();
    } catch (e: any) {
      setError(e?.message || "Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateCategory(category.id, { name, description });
      setIsEditing(false);
      onUpdate && onUpdate();
    } catch (e: any) {
      setError(e?.message || "Failed to update category.");
    } finally {
      setLoading(false);
    }
  };

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

        {/* Error */}
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        {/* Details or Edit Form */}
        <div className="space-y-4 mb-6">
          <DetailRow label="ID" value={category.id} />
          <DetailRow label="Slug" value={category.slug || 'N/A'} />
          <DetailRow label="Product Count" value={category.count} />
          <DetailRow label="Parent ID" value={category.parent || 'None'} />
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                className="w-full border rounded px-2 py-1 mb-2"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <DetailRow label="Description" value={category.description || 'No description.'} />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1"
            onClick={handleDelete}
            disabled={loading}
          >
            <span className="material-icons text-base">delete</span>
            Delete
          </button>
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1" disabled>
            <span className="material-icons text-base">visibility</span>
            View Products
          </button>
          {isEditing ? (
            <>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1"
                onClick={handleEdit}
                disabled={loading}
              >
                <span className="material-icons text-base">save</span>
                Save
              </button>
              <button
                className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                <span className="material-icons text-base">close</span>
                Cancel
              </button>
            </>
          ) : (
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center gap-1"
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              <span className="material-icons text-base">edit</span>
              Edit
            </button>
          )}
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