import Papa from 'papaparse';

/**
 * Parse a CSV file and return product data
 * @param {File} file - The CSV file to parse
 * @returns {Promise<Array>} - Array of product objects
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // Automatically convert strings to numbers where appropriate
      complete: (results) => {
        if (results.errors && results.errors.length > 0) {
          console.warn('CSV parsing had some errors:', results.errors);
        }
        
        // Clean the data
        const products = results.data.map(normalizeProductData);
        resolve(products);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

/**
 * Normalize and clean product data from CSV
 * @param {Object} product - Raw product data from CSV
 * @returns {Object} - Cleaned product data
 */
const normalizeProductData = (product) => {
  // Make sure all products have the required fields
  const normalizedProduct = {
    ...product,
    type: (product.type || 'simple').toLowerCase(),
    sku: product.sku || '',
    name: product.name || '',
    description: product.description || '',
    short_description: product.short_description || '',
    regular_price: product.regular_price?.toString() || '',
    sale_price: product.sale_price?.toString() || '',
    stock_quantity: parseInt(product.stock_quantity, 10) || null,
    manage_stock: convertToBoolean(product.manage_stock),
    stock_status: product.stock_status || 'instock'
  };
  
  return normalizedProduct;
};

/**
 * Convert various values to boolean
 * @param {*} value - Input value
 * @returns {boolean} - Converted boolean value
 */
const convertToBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const lowercased = value.toLowerCase().trim();
    return lowercased === 'true' || lowercased === 'yes' || lowercased === '1';
  }
  return false;
};
