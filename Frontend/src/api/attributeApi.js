/**
 * API functions for attribute operations
 * 
 * Note: These are placeholder implementations that simulate API calls.
 * Replace with actual API calls when integrating with the backend.
 */

export const fetchAttributes = async (apiConfig) => {
  // This is a placeholder that simulates fetching attributes from the API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response with some dummy attributes
      const attributes = [
        { 
          id: 1, 
          name: 'Color', 
          slug: 'pa_color', 
          type: 'select', 
          order_by: 'menu_order', 
          has_archives: true,
          terms: [
            { id: 1, name: 'Red', slug: 'red', count: 8 },
            { id: 2, name: 'Blue', slug: 'blue', count: 10 },
            { id: 3, name: 'Green', slug: 'green', count: 7 },
            { id: 4, name: 'Yellow', slug: 'yellow', count: 5 },
            { id: 5, name: 'Black', slug: 'black', count: 12 }
          ]
        },
        { 
          id: 2, 
          name: 'Size', 
          slug: 'pa_size', 
          type: 'select', 
          order_by: 'menu_order', 
          has_archives: true,
          terms: [
            { id: 6, name: 'Small', slug: 'small', count: 10 },
            { id: 7, name: 'Medium', slug: 'medium', count: 15 },
            { id: 8, name: 'Large', slug: 'large', count: 12 },
            { id: 9, name: 'X-Large', slug: 'x-large', count: 8 }
          ]
        },
        { 
          id: 3, 
          name: 'Material', 
          slug: 'pa_material', 
          type: 'select', 
          order_by: 'name', 
          has_archives: false,
          terms: [
            { id: 10, name: 'Cotton', slug: 'cotton', count: 7 },
            { id: 11, name: 'Polyester', slug: 'polyester', count: 5 },
            { id: 12, name: 'Leather', slug: 'leather', count: 3 },
            { id: 13, name: 'Wool', slug: 'wool', count: 2 }
          ]
        },
        { 
          id: 4, 
          name: 'Brand', 
          slug: 'pa_brand', 
          type: 'select', 
          order_by: 'name', 
          has_archives: true,
          terms: [
            { id: 14, name: 'Nike', slug: 'nike', count: 8 },
            { id: 15, name: 'Adidas', slug: 'adidas', count: 7 },
            { id: 16, name: 'Puma', slug: 'puma', count: 5 }
          ]
        },
        { 
          id: 5, 
          name: 'Features', 
          slug: 'pa_features', 
          type: 'select', 
          order_by: 'menu_order', 
          has_archives: false,
          terms: [
            { id: 17, name: 'Waterproof', slug: 'waterproof', count: 4 },
            { id: 18, name: 'Breathable', slug: 'breathable', count: 6 },
            { id: 19, name: 'Wireless', slug: 'wireless', count: 3 }
          ]
        }
      ];
      
      resolve(attributes);
    }, 800);
  });
};
