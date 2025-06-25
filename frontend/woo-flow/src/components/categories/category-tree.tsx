"use client";

import { FC, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryDetailModal } from "@/components/categories/category-detail-modal";

interface Category {
  id: number;
  name: string;
  parent: number;
  count: number;
  slug?: string;
  description?: string;
}

interface CategoryTreeProps {
  categories: Category[];
  isLoading: boolean;
}

interface TreeNode extends Category {
  children: TreeNode[];
}

// Function to build the tree from a flat array
const buildTree = (categories: Category[]): TreeNode[] => {
  const tree: TreeNode[] = [];
  const childrenOf: { [key: number]: TreeNode[] } = {};

  categories.forEach(item => {
    if (!childrenOf[item.id]) {
      childrenOf[item.id] = [];
    }
    const node: TreeNode = {
      id: item.id,
      name: item.name,
      count: item.count,
      children: childrenOf[item.id],
    };

    if (item.parent === 0) {
      tree.push(node);
    } else {
      if (!childrenOf[item.parent]) {
        childrenOf[item.parent] = [];
      }
      childrenOf[item.parent].push(node);
    }
  });

  return tree;
};

const CategoryNode: FC<{ node: TreeNode; level: number; onCategoryClick: (category: TreeNode) => void }> = ({ node, level, onCategoryClick }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div 
        className={`flex items-center p-2 rounded-md ${level > 0 ? `ml-${level * 4}` : ''} hover:bg-accent cursor-pointer transition-colors duration-150`}
        style={{ marginLeft: `${level * 1.5}rem` }}
        onClick={() => onCategoryClick(node)}
      >
        {hasChildren && (
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="mr-2 p-1 rounded-full hover:bg-muted">
            <span className="material-icons text-base transition-transform" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
              chevron_right
            </span>
          </button>
        )}
        <span className={`font-medium ${hasChildren ? '' : 'ml-8'}`}>{node.name}</span>
        <span className="ml-auto text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{node.count}</span>
      </div>
      {isOpen && hasChildren && (
        <div className="border-l border-zinc-200">
          {node.children.map(child => <CategoryNode key={child.id} node={child} level={level + 1} onCategoryClick={onCategoryClick} />)}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: FC<CategoryTreeProps> = ({ categories, isLoading }) => {
  const [selectedCategory, setSelectedCategory] = useState<TreeNode | null>(null);

  if (isLoading) {
    return (
      <div className="bg-card p-6 rounded-lg shadow-sm">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 mb-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  const categoryTree = buildTree(categories);

  return (
    <>
      <div className="bg-card p-6 rounded-lg shadow-sm">
        {categoryTree.map(node => <CategoryNode key={node.id} node={node} level={0} onCategoryClick={setSelectedCategory} />)}
      </div>
      <CategoryDetailModal category={selectedCategory} onClose={() => setSelectedCategory(null)} />
    </>
  );
}; 