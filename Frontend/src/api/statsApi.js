/**
 * API functions for statistics
 * 
 * Note: These are placeholder implementations that simulate API calls.
 * Replace with actual API calls when integrating with the backend.
 */

export const fetchStoreStats = async (apiConfig) => {
  // This is a placeholder that simulates fetching store statistics
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response
      resolve({
        products: {
          total: 50,
          simple: 30,
          variable: 15,
          grouped: 3,
          external: 2,
          recent: [
            { id: 1, name: 'Latest Product', type: 'simple', price: '59.99', status: 'publish' },
            { id: 2, name: 'New Variable Product', type: 'variable', price: '89.99', status: 'publish' },
            { id: 3, name: 'Draft Product', type: 'simple', price: '19.99', status: 'draft' },
            { id: 4, name: 'Grouped Items', type: 'grouped', price: '149.99', status: 'publish' }
          ]
        },
        categories: {
          total: 12,
          parent: 5,
          children: 7,
          popular: [
            { id: 1, name: 'Clothing', slug: 'clothing', count: 15 },
            { id: 2, name: 'Electronics', slug: 'electronics', count: 10 },
            { id: 3, name: 'Books', slug: 'books', count: 8 },
            { id: 4, name: 'Home & Kitchen', slug: 'home-kitchen', count: 7 }
          ]
        },
        attributes: {
          total: 8,
          global: 5,
          local: 3
        },
        tags: {
          total: 25
        }
      });
    }, 1000);
  });
};
