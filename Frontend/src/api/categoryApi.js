/**
 * API functions for category operations
 * 
 * Note: These are placeholder implementations that simulate API calls.
 * Replace with actual API calls when integrating with the backend.
 */

export const fetchCategories = async (apiConfig) => {
  // This is a placeholder that simulates fetching categories from the API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response with some dummy categories
      const categories = [
        { id: 1, name: 'Clothing', slug: 'clothing', count: 15, description: 'All clothing items', parent: 0 },
        { id: 2, name: 'Men', slug: 'clothing-men', count: 8, description: 'Men\'s clothing', parent: 1 },
        { id: 3, name: 'Women', slug: 'clothing-women', count: 7, description: 'Women\'s clothing', parent: 1 },
        { id: 4, name: 'T-shirts', slug: 'clothing-men-tshirts', count: 4, description: 'Men\'s t-shirts', parent: 2 },
        { id: 5, name: 'Jeans', slug: 'clothing-men-jeans', count: 4, description: 'Men\'s jeans', parent: 2 },
        { id: 6, name: 'Dresses', slug: 'clothing-women-dresses', count: 3, description: 'Women\'s dresses', parent: 3 },
        { id: 7, name: 'Skirts', slug: 'clothing-women-skirts', count: 2, description: 'Women\'s skirts', parent: 3 },
        { id: 8, name: 'Electronics', slug: 'electronics', count: 10, description: 'Electronic items', parent: 0 },
        { id: 9, name: 'Computers', slug: 'electronics-computers', count: 5, description: 'Computers and accessories', parent: 8 },
        { id: 10, name: 'Phones', slug: 'electronics-phones', count: 5, description: 'Mobile phones and accessories', parent: 8 },
        { id: 11, name: 'Books', slug: 'books', count: 8, description: 'Books of all genres', parent: 0 },
        { id: 12, name: 'Fiction', slug: 'books-fiction', count: 5, description: 'Fiction books', parent: 11 },
        { id: 13, name: 'Non-fiction', slug: 'books-non-fiction', count: 3, description: 'Non-fiction books', parent: 11 }
      ];
      
      resolve(categories);
    }, 800);
  });
};
