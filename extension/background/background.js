// LinkVault Extension Background Script

// Extension settings and constants
const APP_URL = 'https://your-linkvault-app-url.com';
const SYNC_INTERVAL = 60000; // 1 minute
const API_ENDPOINT = `${APP_URL}/api/sync`;

// Set up alarm for periodic sync
chrome.alarms.create('syncAlarm', {
  periodInMinutes: 1 // Sync every minute
});

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize extension storage on install
    await chrome.storage.sync.set({
      links: [],
      categories: [
        { id: "1", name: "Uncategorized", color: "oklch(0.5 0.15 260)" },
        { id: "2", name: "Work", color: "oklch(0.6 0.2 140)" },
        { id: "3", name: "Personal", color: "oklch(0.6 0.2 50)" }
      ],
      lastSyncTime: null
    });
    
    // Open welcome page
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome/welcome.html') });
  }
});

// Listen for alarm events to trigger sync
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncAlarm') {
    syncData();
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'syncData') {
    syncData();
  }
  
  // Return true to indicate async response
  return true;
});

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'save_link') {
    // Get current tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      saveLink(tabs[0]);
    }
  }
});

// Save current link
async function saveLink(tab) {
  try {
    // Get current data
    const data = await chrome.storage.sync.get(['links', 'categories']);
    const links = data.links || [];
    
    // Check if link is already saved
    const alreadySaved = links.some(link => link.url === tab.url);
    if (alreadySaved) {
      // No need to save again, but we'll show a notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/icons/icon128.png',
        title: 'LinkVault',
        message: 'This link is already saved in your vault.'
      });
      return;
    }
    
    // Create new link object
    const domain = new URL(tab.url).hostname.replace('www.', '');
    const newLink = {
      id: Date.now().toString(),
      url: tab.url,
      title: tab.title,
      favicon: tab.favIconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      addedAt: Date.now(),
      tags: ['Uncategorized'] // Default category
    };
    
    // Add to links array
    links.unshift(newLink);
    
    // Save to storage
    await chrome.storage.sync.set({ links });
    
    // Show success notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'LinkVault',
      message: 'Link saved successfully!'
    });
    
    // Trigger sync
    syncData();
  } catch (error) {
    console.error('Error saving link:', error);
    
    // Show error notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '/icons/icon128.png',
      title: 'LinkVault',
      message: 'Error saving link. Please try again.'
    });
  }
}

// Sync data with web app
async function syncData() {
  try {
    // Get current data
    const data = await chrome.storage.sync.get(['links', 'categories', 'lastSyncTime']);
    const links = data.links || [];
    const categories = data.categories || [];
    const lastSyncTime = data.lastSyncTime || null;
    
    // In a real implementation, this would make an API request to your server
    // For now, we'll simulate a successful sync
    console.log('Syncing data with server...', {
      linksCount: links.length,
      categoriesCount: categories.length,
      lastSyncTime
    });
    
    // Update last sync time
    await chrome.storage.sync.set({
      lastSyncTime: Date.now()
    });
    
    // Update extension badge to show number of saved links
    updateBadge(links.length);
  } catch (error) {
    console.error('Error syncing data:', error);
  }
}

// Update extension badge
function updateBadge(count) {
  if (count > 0) {
    chrome.action.setBadgeText({ text: count.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#4a5fe6' }); // Primary color
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}