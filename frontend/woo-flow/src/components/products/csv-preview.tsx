"use client";

import { useState } from "react";
import { ProductPreviewCard } from "./product-preview-card";

interface CSVPreviewProps {
  data: any[];
  fileName: string;
}

export function CSVPreview({ data, fileName }: CSVPreviewProps) {
  const [currentTab, setCurrentTab] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  
  if (!data || data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No data found in the CSV file.
      </div>
    );
  }
  
  // Get headers from the first object keys
  const headers = Object.keys(data[0]);
  
  // Calculate pagination
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  // Group by product type
  const simpleProducts = data.filter(item => item.type === 'simple');
  const variableProducts = data.filter(item => item.type === 'variable');
  
  return (
    <div className="overflow-y-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <span className="text-sm text-muted-foreground mr-2">File:</span>
          <span className="font-medium">{fileName}</span>
          <span className="mx-2 text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{data.length} products found</span>
        </div>
        
        <div className="flex items-center space-x-1 bg-muted/30 rounded-md p-1">
          <button
            className={`px-3 py-1 text-sm rounded-md ${currentTab === 'table' ? 'bg-card shadow-sm' : ''}`}
            onClick={() => setCurrentTab('table')}
          >
            Table View
          </button>
          <button
            className={`px-3 py-1 text-sm rounded-md ${currentTab === 'cards' ? 'bg-card shadow-sm' : ''}`}
            onClick={() => setCurrentTab('cards')}
          >
            Card View
          </button>
        </div>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg mb-4">
        <h4 className="font-medium mb-2">Product Summary:</h4>
        <ul className="grid grid-cols-3 gap-2">
          <li className="flex">
            <span className="text-sm text-muted-foreground w-32">Simple Products:</span>
            <span className="font-medium">{simpleProducts.length}</span>
          </li>
          <li className="flex">
            <span className="text-sm text-muted-foreground w-32">Variable Products:</span>
            <span className="font-medium">{variableProducts.length}</span>
          </li>
        </ul>
      </div>
      
      {currentTab === 'table' ? (
        <div className="border border-zinc-200 rounded-lg overflow-hidden max-h-[50vh]">
          <div className="overflow-x-auto overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  {headers.slice(0, 6).map((header, idx) => (
                    <th key={idx} className="py-2 px-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                    {headers.slice(0, 6).map((header, cellIdx) => (
                      <td key={cellIdx} className="py-2 px-3 text-sm">
                        {row[header]?.toString().substring(0, 50) || '-'}
                        {row[header]?.toString().length > 50 ? '...' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pb-2">
          {paginatedData.map((product, idx) => (
            <ProductPreviewCard key={idx} product={product} />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 rounded-md hover:bg-muted disabled:opacity-50"
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            <span className="material-icons">chevron_left</span>
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            // Show pages around the current page
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = idx + 1;
            } else if (page <= 3) {
              pageNumber = idx + 1;
            } else if (page >= totalPages - 2) {
              pageNumber = totalPages - 4 + idx;
            } else {
              pageNumber = page - 2 + idx;
            }
            
            return (
              <button
                key={idx}
                className={`w-8 h-8 rounded-md text-sm ${page === pageNumber ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button
            className="p-1 rounded-md hover:bg-muted disabled:opacity-50"
            onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
          >
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
