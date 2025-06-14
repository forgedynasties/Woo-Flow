import React, { useState } from 'react';
import { toast } from 'react-toastify';
import CSVUploader from '../CSVUploader';
import ProductPreview from './ProductPreview';
import ImportButton from '../ImportButton';
import { parseCSV } from '../../utils/csvUtils';
import { importProducts } from '../../api/productApi';
import './CSVImporter.css';

const CSVImporter = ({ apiConfig, onImportSuccess }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [importProgress, setImportProgress] = useState(0);

  const handleFileUpload = async (file) => {
    setIsLoading(true);
    setFileName(file.name);

    try {
      const parsedProducts = await parseCSV(file);
      
      // Group variations under their parent products
      const groupedProducts = groupProductsAndVariations(parsedProducts);
      
      setProducts(groupedProducts);
      toast.success(`Successfully parsed ${file.name}`);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast.error(`Error parsing file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const groupProductsAndVariations = (products) => {
    const grouped = [];
    let currentParent = null;
    
    products.forEach(product => {
      if (product.type === 'simple') {
        // Simple product, just add it directly
        grouped.push({ ...product, variations: [] });
      } else if (product.type === 'variable') {
        // Variable product, set as current parent
        currentParent = { ...product, variations: [] };
        grouped.push(currentParent);
      } else if (product.type === 'variation' && currentParent) {
        // Variation, add to current parent's variations array
        const parentIndex = grouped.findIndex(p => p === currentParent);
        if (parentIndex !== -1) {
          grouped[parentIndex].variations.push(product);
        }
      }
    });
    
    return grouped;
  };

  const handleImport = async () => {
    if (!products.length) {
      toast.warning('No products to import');
      return;
    }

    setImportProgress(0);
    
    try {
      setIsLoading(true);
      
      // Simulate progress updates
      const interval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
      
      // Call import API
      const result = await importProducts(apiConfig, products, (progress) => {
        setImportProgress(progress);
      });

      // Final progress
      setImportProgress(100);
      
      toast.success(`Successfully imported ${result.imported} products!`);
      
      // Reset state and notify parent
      setTimeout(() => {
        setProducts([]);
        setFileName('');
        setImportProgress(0);
        onImportSuccess && onImportSuccess(result);
      }, 1000);
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="csv-importer">
      <div className="card importer-upload-section">
        <h3 className="section-title">Upload Product CSV</h3>
        <CSVUploader onFileUpload={handleFileUpload} isLoading={isLoading} />
        
        {fileName && <p className="file-name">Current file: {fileName}</p>}
        
        <ImportButton 
          onClick={handleImport} 
          isLoading={isLoading}
          progress={importProgress} 
          disabled={products.length === 0 || isLoading}
        />
      </div>
      
      <div className="card importer-preview-section">
        <h3 className="section-title">Product Preview</h3>
        <ProductPreview products={products} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default CSVImporter;
