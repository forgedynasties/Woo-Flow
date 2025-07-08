"use client";

import React from "react";

interface CsvGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const csvTemplate = `type,sku,name,description,short_description,regular_price,sale_price,manage_stock,stock_quantity,stock_status,status,category_1,category_2,category_3,image_1,image_2,attr_name_1,attr_value_1,attr_var_1,attr_name_2,attr_value_2,attr_var_2\nsimple,TS-001,Basic T-Shirt,A comfortable cotton t-shirt for everyday wear.,Classic cotton t-shirt,19.99,17.99,true,50,instock,publish,Clothing,T-Shirts,,https://example.com/tshirt.jpg,,Material,"Cotton, Polyester",false,,,\nvariable,HDY-BASE,Premium Hoodie,Our premium hoodie comes in various colors and sizes.,Soft cotton hoodie,49.99,,true,100,instock,publish,Clothing,Hoodies,,https://example.com/hoodie.jpg,,Color,"Red,Blue,Green",true,Size,"S,M,L,XL",true\nvariation,HDY-RED-S,,,,,45.99,true,25,instock,,,,,https://example.com/hoodie-red.jpg,,Color,Red,,Size,S,\nvariation,HDY-RED-M,,,,,45.99,true,30,instock,,,,,https://example.com/hoodie-red.jpg,,Color,Red,,Size,M,\nvariation,HDY-BLUE-M,,,,,47.99,true,20,instock,,,,,https://example.com/hoodie-blue.jpg,,Color,Blue,,Size,M,\nvariation,HDY-GREEN-L,,,,,49.99,true,15,instock,,,,,https://example.com/hoodie-green.jpg,,Color,Green,,Size,L,\nsimple,COF-ORG,Organic Coffee,Sustainably sourced organic coffee beans,Organic fair-trade coffee,10.99,,true,200,instock,publish,Food,Beverages,,,,,,,,,\n`;

// Enhanced parser: auto-detects separator (comma or tab) and handles quoted fields
function parseDelimited(text: string): string[][] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];
  // Detect separator: if any line contains tabs, use tab, else comma
  const sep = lines.some(line => line.includes('\t')) ? '\t' : ',';
  return lines.map(line => {
    if (sep === ',') {
      // CSV: handle quoted fields with commas
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    } else {
      // TSV: just split on tab
      return line.split('\t');
    }
  });
}

export function CsvGuideModal({ isOpen, onClose }: CsvGuideModalProps) {
  if (!isOpen) return null;

  const csvRows = parseDelimited(csvTemplate);
  const headers = csvRows[0];
  const rows = csvRows.slice(1);

  const handleDownload = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'woo-flow-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">CSV Import/Export Guide</h3>
          <button 
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          <h4 className="font-medium mb-2">CSV Template Example</h4>
          <div className="bg-muted/30 p-2 rounded mb-4 overflow-x-auto">
            <table className="text-xs w-full border border-zinc-200">
              <thead>
                <tr>
                  {headers.map((header, idx) => (
                    <th key={idx} className="border-b border-zinc-200 px-2 py-1 text-left bg-muted font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => {
                  // Pad the row to match header length
                  const paddedRow = [...row];
                  while (paddedRow.length < headers.length) paddedRow.push("");
                  return (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/20'}>
                      {paddedRow.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-2 py-1 border-b border-zinc-100 max-w-[180px] truncate" title={cell}>{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <h4 className="font-medium mb-2">How to Import Products</h4>
          <div className="mb-2 p-2 bg-amber-100 text-amber-800 rounded text-xs">
            <b>Note:</b> This CSV format is <b>only compatible with Woo Flow</b> and is <b>not directly compatible with WooCommerce</b> imports.
          </div>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
            <li>First row must contain column headers as shown above.</li>
            <li>Required columns: <b>type</b>, <b>sku</b>, <b>name</b>, <b>regular_price</b>.</li>
            <li>Use <b>simple</b>, <b>variable</b>, and <b>variation</b> in the <b>type</b> column.</li>
            <li>For variable products, add one or more <b>variation</b> rows after the parent <b>variable</b> row.</li>
            <li>Images can be specified as URLs in <b>image_1</b>, <b>image_2</b>, etc.</li>
            <li>Attributes and variations can be set using <b>attr_name_*</b>, <b>attr_value_*</b>, <b>attr_var_*</b> columns.</li>
            <li>Download the template and edit in a spreadsheet editor for best results.</li>
          </ul>
          <h4 className="font-medium mb-2">How to Export Products</h4>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Click <b>Export</b> to download all products as a CSV file in the same format.</li>
            <li>You can re-import the exported CSV to update or restore products.</li>
          </ul>
        </div>
        <div className="flex justify-end mt-6 pt-4 border-t border-zinc-200 gap-2">
          <button 
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center"
            onClick={handleDownload}
          >
            <span className="material-icons text-base mr-1">download</span>
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
} 