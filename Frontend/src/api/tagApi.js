/**
 * API functions for tag operations
 * 
 * Note: These are placeholder implementations that simulate API calls.
 * Replace with actual API calls when integrating with the backend.
 */

export const fetchTags = async (apiConfig) => {
  // This is a placeholder that simulates fetching tags from the API
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate API response with some dummy tags
      const tags = [
        { id: 1, name: 'Sale', slug: 'sale', count: 20 },
        { id: 2, name: 'New Arrival', slug: 'new-arrival', count: 15 },
        { id: 3, name: 'Featured', slug: 'featured', count: 10 },
        { id: 4, name: 'Bestseller', slug: 'bestseller', count: 8 },
        { id: 5, name: 'Summer', slug: 'summer', count: 12 },
        { id: 6, name: 'Winter', slug: 'winter', count: 10 },
        { id: 7, name: 'Clearance', slug: 'clearance', count: 5 },
        { id: 8, name: 'Eco-friendly', slug: 'eco-friendly', count: 7 },
        { id: 9, name: 'Limited Edition', slug: 'limited-edition', count: 3 },
        { id: 10, name: 'Handmade', slug: 'handmade', count: 6 },
        { id: 11, name: 'Organic', slug: 'organic', count: 4 },
        { id: 12, name: 'Vegan', slug: 'vegan', count: 3 },
        { id: 13, name: 'Premium', slug: 'premium', count: 9 },
        { id: 14, name: 'Budget', slug: 'budget', count: 7 },
        { id: 15, name: 'Gift', slug: 'gift', count: 11 },
        { id: 16, name: 'For Kids', slug: 'for-kids', count: 8 },
        { id: 17, name: 'For Men', slug: 'for-men', count: 14 },
        { id: 18, name: 'For Women', slug: 'for-women', count: 16 },
        { id: 19, name: 'Imported', slug: 'imported', count: 5 },
        { id: 20, name: 'Local', slug: 'local', count: 4 }
      ];
      
      resolve(tags);
    }, 800);
  });
};
