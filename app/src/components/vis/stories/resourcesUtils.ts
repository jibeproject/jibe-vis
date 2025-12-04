import resources from './resources.json';

export interface ResourceItem {
  title: string;
  category: string;
  description: string;
  formats: string;
  citation: string;
  licence: string;
  url: string;
  year?: string;
  journal?: string;
  img?: string;
}

/**
 * Gets all unique categories from resources.json
 * Categories are returned in the order they first appear in the data
 */
export function getResourceCategories(): string[] {
  const categories: string[] = [];
  (resources as ResourceItem[]).forEach((item) => {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });
  return categories;
}

/**
 * Gets all resources filtered by category, sorted by year (descending) then by citation (ascending)
 */
export function getResourcesByCategory(category: string): ResourceItem[] {
  return (resources as ResourceItem[])
    .filter((item) => item.category === category)
    .sort((a, b) => {
      // Sort by year descending (if year exists)
      const yearA = a.year ? parseInt(a.year, 10) : 0;
      const yearB = b.year ? parseInt(b.year, 10) : 0;
      
      if (yearA !== yearB) {
        return yearB - yearA; // Descending order (newer first)
      }
      
      // If years are the same or both missing, sort by citation alphabetically
      return a.citation.localeCompare(b.citation);
    });
}

/**
 * Converts category name to display format (e.g., 'presentations' -> 'Presentations')
 */
export function formatCategoryName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Converts category to URL-friendly format (e.g., 'presentations' -> 'presentations')
 */
export function getCategoryId(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}
