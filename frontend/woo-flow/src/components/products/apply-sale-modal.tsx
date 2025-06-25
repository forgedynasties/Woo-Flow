"use client";

import { FC, useState } from "react";

interface ApplySaleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Action = 'apply' | 'remove';
type SaleType = 'percentage' | 'fixed';

export const ApplySaleModal: FC<ApplySaleModalProps> = ({ isOpen, onClose }) => {
  const [action, setAction] = useState<Action>('apply');
  const [saleType, setSaleType] = useState<SaleType>('percentage');
  const [saleValue, setSaleValue] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleApply = () => {
    // This is where the logic to apply/remove the sale will go.
    // For now, it just logs the state to the console.
    console.log({ action, saleType, saleValue, categories, tags });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Apply/Remove Sale</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Action Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-md">
            <button onClick={() => setAction('apply')} className={`w-full py-2 text-sm rounded-md ${action === 'apply' ? 'bg-card shadow-sm' : ''}`}>Apply Sale</button>
            <button onClick={() => setAction('remove')} className={`w-full py-2 text-sm rounded-md ${action === 'remove' ? 'bg-card shadow-sm' : ''}`}>Remove Sale</button>
          </div>

          {action === 'apply' && (
            <>
              {/* Sale Type & Value */}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Sale Type</label>
                  <select value={saleType} onChange={e => setSaleType(e.target.value as SaleType)} className="w-full px-3 py-2 bg-input border border-zinc-200 rounded-md">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input type="number" value={saleValue} onChange={e => setSaleValue(e.target.value)} className="w-full px-3 py-2 bg-input border border-zinc-200 rounded-md" placeholder={saleType === 'percentage' ? 'e.g., 15' : 'e.g., 10.00'} />
                </div>
              </div>
            </>
          )}

          {/* Filters */}
          <div>
            <h4 className="text-md font-medium mb-2">Apply to products where:</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category is one of:</label>
                {/* A real multi-select component will replace this input */}
                <input className="w-full px-3 py-2 bg-input border border-zinc-200 rounded-md" placeholder="e.g., Clothing, T-Shirts" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tag is one of:</label>
                {/* A real multi-select component will replace this input */}
                <input className="w-full px-3 py-2 bg-input border border-zinc-200 rounded-md" placeholder="e.g., Summer, Sale" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 mt-8 pt-4 border-t border-zinc-200">
          <button onClick={onClose} className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80">
            {action === 'apply' ? 'Apply Sale' : 'Remove Sale'}
          </button>
        </div>
      </div>
    </div>
  );
};
