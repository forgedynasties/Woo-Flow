"use client";

import { useState } from "react";

interface ExportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportProductsModal({ isOpen, onClose }: ExportProductsModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "images" | "both">("csv");
  const [exportFilter, setExportFilter] = useState<"all" | "category" | "tag" | "search">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Mock data for categories and tags
  const categories = ["Clothing", "Electronics", "Home", "Books", "Furniture"];
  const tags = ["Featured", "Sale", "New", "Popular", "Clearance"];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    
    // In a real implementation, you would call the API to export data
    // const params: any = {};
    // 
    // if (exportFilter === "category" && selectedCategory) {
    //   params.category = selectedCategory;
    // } else if (exportFilter === "tag" && selectedTag) {
    //   params.tag = selectedTag;
    // } else if (exportFilter === "search" && searchQuery) {
    //   params.search = searchQuery;
    // }
    //
    // const response = await fetch(`/api/products/export?format=${exportFormat}`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(params),
    // });
    //
    // if (response.ok) {
    //   const blob = await response.blob();
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   a.href = url;
    //   a.download = `products_export_${new Date().toISOString().slice(0, 10)}.zip`;
    //   a.click();
    //   URL.revokeObjectURL(url);
    // }
    
    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setExportProgress(100);
      
      // Simulate download after export is complete
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        
        // Show download success message
        alert("Export completed! Your download should start automatically.");
        
        onClose();
      }, 500);
    }, 3000);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Export Products</h3>
          <button 
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            disabled={isExporting}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {!isExporting ? (
          <div className="space-y-6">
            {/* Export format selection */}
            <div>
              <h4 className="font-medium mb-3">Export Format</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="csv"
                    name="export-format"
                    value="csv"
                    checked={exportFormat === "csv"}
                    onChange={() => setExportFormat("csv")}
                    className="mr-2"
                  />
                  <label htmlFor="csv">CSV Only</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="images"
                    name="export-format"
                    value="images"
                    checked={exportFormat === "images"}
                    onChange={() => setExportFormat("images")}
                    className="mr-2"
                  />
                  <label htmlFor="images">Images Only (ZIP)</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="both"
                    name="export-format"
                    value="both"
                    checked={exportFormat === "both"}
                    onChange={() => setExportFormat("both")}
                    className="mr-2"
                  />
                  <label htmlFor="both">Both CSV & Images (ZIP)</label>
                </div>
              </div>
            </div>
            
            {/* Export filter */}
            <div>
              <h4 className="font-medium mb-3">Products to Export</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="all"
                    name="export-filter"
                    value="all"
                    checked={exportFilter === "all"}
                    onChange={() => setExportFilter("all")}
                    className="mr-2"
                  />
                  <label htmlFor="all">All Products</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="category"
                    name="export-filter"
                    value="category"
                    checked={exportFilter === "category"}
                    onChange={() => setExportFilter("category")}
                    className="mr-2"
                  />
                  <label htmlFor="category">By Category</label>
                </div>
                {exportFilter === "category" && (
                  <div className="ml-6 mt-2">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-2 border border-zinc-200 rounded-md"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="tag"
                    name="export-filter"
                    value="tag"
                    checked={exportFilter === "tag"}
                    onChange={() => setExportFilter("tag")}
                    className="mr-2"
                  />
                  <label htmlFor="tag">By Tag</label>
                </div>
                {exportFilter === "tag" && (
                  <div className="ml-6 mt-2">
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full p-2 border border-zinc-200 rounded-md"
                    >
                      <option value="">Select a tag</option>
                      {tags.map((tag) => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="search"
                    name="export-filter"
                    value="search"
                    checked={exportFilter === "search"}
                    onChange={() => setExportFilter("search")}
                    className="mr-2"
                  />
                  <label htmlFor="search">By Search Query</label>
                </div>
                {exportFilter === "search" && (
                  <div className="ml-6 mt-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter search terms..."
                      className="w-full p-2 border border-zinc-200 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Image naming information */}
            {exportFormat !== "csv" && (
              <div className="bg-muted/30 p-4 rounded-md">
                <h4 className="font-medium mb-2">Image Naming Convention</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Main product image: <code className="bg-muted px-1">[SKU].[ext]</code></li>
                  <li>Gallery images: <code className="bg-muted px-1">[SKU]_1.[ext]</code>, <code className="bg-muted px-1">[SKU]_2.[ext]</code>...</li>
                  <li>For products without SKU, product ID will be used instead</li>
                </ul>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 border-t border-zinc-200">
              <button
                type="button"
                className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center"
                disabled={
                  (exportFilter === "category" && !selectedCategory) ||
                  (exportFilter === "tag" && !selectedTag) ||
                  (exportFilter === "search" && !searchQuery)
                }
              >
                Export
                <span className="material-icons text-sm ml-1">download</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-8">
            <div className="text-center mb-4">
              <span className="material-icons text-4xl text-primary animate-pulse">downloading</span>
              <h4 className="font-medium mt-2">Preparing Export...</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {exportProgress < 100 ? 'Processing products' : 'Download ready!'}
              </p>
            </div>
            
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              {exportProgress < 100 
                ? "Please wait while we prepare your files..." 
                : "Your download should start automatically"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
