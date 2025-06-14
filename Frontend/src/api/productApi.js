/**
 * API functions for product operations
 * 
 * Note: These are placeholder implementations that simulate API calls.
 * Replace with actual API calls when integrating with the backend.
 */

export const fetchProducts = async (apiConfig, page = 1) => {
  // This is a placeholder that simulates fetching products from the API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response
      const totalProducts = 50;
      const perPage = 10;
      const totalPages = Math.ceil(totalProducts / perPage);
      
      const products = Array.from({ length: Math.min(perPage, totalProducts - (page - 1) * perPage) }, (_, i) => ({
        id: (page - 1) * perPage + i + 1,
        name: `Product ${(page - 1) * perPage + i + 1}`,
        sku: `SKU-${(page - 1) * perPage + i + 1}`,
        price: ((page - 1) * perPage + i + 1) * 10,
        sale_price: i % 3 === 0 ? ((page - 1) * perPage + i + 1) * 8 : null,
        type: i % 3 === 0 ? 'simple' : i % 3 === 1 ? 'variable' : 'grouped',
        status: i % 4 === 0 ? 'draft' : 'publish',
        images: [
          { 
            id: ((page - 1) * perPage + i + 1) * 100,
            src: `https://picsum.photos/seed/product${(page - 1) * perPage + i + 1}/200/200`
          }
        ]
      }));
      
      resolve({
        products,
        totalPages,
        currentPage: page,
        totalProducts
      });
    }, 800);
  });
};

export const fetchProductStats = async (apiConfig) => {
  // This is a placeholder that simulates fetching product statistics
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response
      resolve({
        total: 50,
        typeBreakdown: {
          simple: 30,
          variable: 15,
          grouped: 3,
          external: 2
        },
        statusBreakdown: {
          publish: 42,
          draft: 6,
          pending: 2
        },
        stockStatus: {
          instock: 35,
          outofstock: 10,
          onbackorder: 5
        },
        priceRanges: {
          "Under $10": 5,
          "$10 - $50": 20,
          "$50 - $100": 15,
          "Over $100": 10
        }
      });
    }, 800);
  });
};

export const importProducts = async (apiConfig, products, onProgress) => {
  // This is a placeholder that simulates importing products
  return new Promise((resolve) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (onProgress) onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Count total products including variations
        let totalCount = 0;
        products.forEach(product => {
          totalCount++; // Count the product itself
          if (product.variations) {
            totalCount += product.variations.length; // Count variations
          }
        });
        
        resolve({
          imported: totalCount,
          failed: 0,
          message: `Successfully imported ${totalCount} products and variations`
        });
      }
    }, 200);
  });
};

/**
 * Validate a product before import
 */
export const validateProduct = (product) => {
  const errors = [];
  
  // Basic validation rules
  if (!product.name && product.type !== 'variation') {
    errors.push('Product name is required');
  }
  
  if (!product.type) {
    errors.push('Product type is required');
  }
  
  if (product.type === 'simple' && !product.regular_price) {
    errors.push('Regular price is required for simple products');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
