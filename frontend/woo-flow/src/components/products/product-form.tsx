"use client";

import { useState } from "react";
import { AttributeField } from "./attribute-field";
import { ImageUploader } from "./image-uploader";

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSaving: boolean;
}

export function ProductForm({ initialData, onSubmit, isSaving }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    type: initialData?.type || "simple",
    description: initialData?.description || "",
    short_description: initialData?.short_description || "",
    regular_price: initialData?.regular_price || "",
    sale_price: initialData?.sale_price || "",
    sku: initialData?.sku || "",
    manage_stock: initialData?.manage_stock || false,
    stock_quantity: initialData?.stock_quantity || "",
    stock_status: initialData?.stock_status || "instock",
    status: initialData?.status || "publish",
    categories: initialData?.categories || [],
    images: initialData?.images || [],
    attributes: initialData?.attributes || []
  });

  const [activeTab, setActiveTab] = useState("basic");
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAttributeChange = (attributes: any[]) => {
    setFormData(prev => ({ ...prev, attributes }));
  };
  
  const handleImagesChange = (images: any[]) => {
    setFormData(prev => ({ ...prev, images }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex space-x-6">
          {['basic', 'inventory', 'attributes', 'images', 'categories'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`py-2 px-1 border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-primary text-primary font-medium' 
                  : 'border-transparent hover:border-muted-foreground/30'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Basic Info */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">Product Type <span className="text-red-500">*</span></label>
              <select
                id="type"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
              >
                <option value="simple">Simple Product</option>
                <option value="variable">Variable Product</option>
                <option value="grouped">Grouped Product</option>
                <option value="external">External Product</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="regular_price" className="block text-sm font-medium mb-1">Regular Price</label>
              <input
                type="text"
                id="regular_price"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.regular_price}
                onChange={(e) => handleChange('regular_price', e.target.value)}
                placeholder="19.99"
              />
            </div>
            
            <div>
              <label htmlFor="sale_price" className="block text-sm font-medium mb-1">Sale Price</label>
              <input
                type="text"
                id="sale_price"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.sale_price}
                onChange={(e) => handleChange('sale_price', e.target.value)}
                placeholder="14.99"
              />
            </div>
            
            <div>
              <label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                id="sku"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
              <select
                id="status"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="publish">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              rows={5}
              className="w-full p-2 border border-zinc-200 rounded-md"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="short_description" className="block text-sm font-medium mb-1">Short Description</label>
            <textarea
              id="short_description"
              rows={3}
              className="w-full p-2 border border-zinc-200 rounded-md"
              value={formData.short_description}
              onChange={(e) => handleChange('short_description', e.target.value)}
            />
          </div>
        </div>
      )}
      
      {/* Inventory */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="manage_stock"
              checked={formData.manage_stock}
              onChange={(e) => handleChange('manage_stock', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="manage_stock" className="text-sm font-medium">Manage Stock</label>
          </div>
          
          {formData.manage_stock && (
            <div>
              <label htmlFor="stock_quantity" className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                id="stock_quantity"
                className="w-full p-2 border border-zinc-200 rounded-md"
                value={formData.stock_quantity}
                onChange={(e) => handleChange('stock_quantity', e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label htmlFor="stock_status" className="block text-sm font-medium mb-1">Stock Status</label>
            <select
              id="stock_status"
              className="w-full p-2 border border-zinc-200 rounded-md"
              value={formData.stock_status}
              onChange={(e) => handleChange('stock_status', e.target.value)}
            >
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
              <option value="onbackorder">On Backorder</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Attributes */}
      {activeTab === 'attributes' && (
        <AttributeField
          attributes={formData.attributes}
          onChange={handleAttributeChange}
          isVariableProduct={formData.type === 'variable'}
        />
      )}
      
      {/* Images */}
      {activeTab === 'images' && (
        <ImageUploader 
          images={formData.images}
          onChange={handleImagesChange}
        />
      )}
      
      {/* Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <p className="text-muted-foreground mb-2">
            Assign this product to categories. You can select multiple categories.
          </p>
          
          <div className="border border-zinc-200 rounded-md p-4">
            <p className="mb-4 text-sm">Categories would be loaded from the API in a real implementation.</p>
            
            {/* Placeholder categories for demo */}
            {['Clothing', 'Electronics', 'Home', 'Books'].map((category) => (
              <div key={category} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  className="mr-2"
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChange('categories', [...formData.categories, { name: category }]);
                    } else {
                      handleChange('categories', 
                        formData.categories.filter((c: any) => c.name !== category)
                      );
                    }
                  }}
                />
                <label htmlFor={`category-${category}`}>{category}</label>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Form actions */}
      <div className="flex justify-end space-x-4 border-t border-zinc-200 pt-4">
        <button
          type="button"
          className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
          onClick={() => window.history.back()}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center"
          disabled={isSaving}
        >
          {isSaving ? (
            <>Processing...</>
          ) : (
            <>
              Save Product
              <span className="material-icons text-sm ml-2">save</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
