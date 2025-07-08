/**
 * API endpoints for browser extension syncing
 * 
 * These are client-side mock implementations for demonstration purposes.
 * In a real application, these would be actual API endpoints on a server.
 */

import { useKV } from '@github/spark/hooks';

// Types
export type Link = {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  addedAt: number;
  tags: string[];
};

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type SyncData = {
  links: Link[];
  categories: Category[];
  lastSyncTime: number;
};

/**
 * Sync data between browser extension and web app
 * @param extensionData Data from the browser extension
 * @returns Updated data for the extension
 */
export async function syncData(extensionData: SyncData): Promise<SyncData> {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // In a real implementation, this would merge data between server and extension
      // For now, we'll just return the extension data
      resolve({
        ...extensionData,
        lastSyncTime: Date.now()
      });
    }, 500);
  });
}

/**
 * React hook for extension sync functionality
 */
export function useExtensionSync() {
  const [links, setLinks] = useKV<Link[]>("saved-links", []);
  const [categories, setCategories] = useKV<Category[]>("link-categories", []);
  
  // Sync local data with extension data
  const syncWithExtension = async (extensionData: SyncData) => {
    // In a real implementation, we would merge the data intelligently
    // For now, we'll just use the latest data based on timestamp
    if (extensionData.lastSyncTime) {
      // Get the latest links by comparing timestamps
      const mergedLinks = mergeArraysByTimestamp(
        links,
        extensionData.links,
        'addedAt'
      );
      
      // Use a set to get unique categories by ID
      const categoryMap = new Map();
      [...categories, ...extensionData.categories].forEach(category => {
        categoryMap.set(category.id, category);
      });
      const mergedCategories = Array.from(categoryMap.values());
      
      // Update the local state
      setLinks(mergedLinks);
      setCategories(mergedCategories);
      
      return {
        links: mergedLinks,
        categories: mergedCategories,
        lastSyncTime: Date.now()
      };
    }
    
    return {
      links,
      categories,
      lastSyncTime: Date.now()
    };
  };
  
  return {
    syncWithExtension,
    links,
    categories
  };
}

// Helper function to merge arrays based on a timestamp field
// This keeps the most recent version of each item based on the ID
function mergeArraysByTimestamp<T extends { id: string; [key: string]: any }>(
  array1: T[],
  array2: T[],
  timestampField: string
): T[] {
  const merged = new Map<string, T>();
  
  // Process both arrays
  [...array1, ...array2].forEach(item => {
    const existingItem = merged.get(item.id);
    
    // If item doesn't exist yet or has a more recent timestamp, use it
    if (!existingItem || item[timestampField] > existingItem[timestampField]) {
      merged.set(item.id, item);
    }
  });
  
  // Convert map back to array and sort by timestamp (newest first)
  return Array.from(merged.values())
    .sort((a, b) => b[timestampField] - a[timestampField]);
}