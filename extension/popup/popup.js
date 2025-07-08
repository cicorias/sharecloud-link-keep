// LinkVault Extension Popup Script

// Extension settings and constants
const APP_URL = 'https://your-linkvault-app-url.com/';
const SYNC_INTERVAL = 60000; // 1 minute

// DOM elements
const pageTitle = document.getElementById('page-title');
const pageUrl = document.getElementById('page-url');
const pageFavicon = document.getElementById('page-favicon');
const saveButton = document.getElementById('save-link');
const openAppButton = document.getElementById('open-app');
const categoryList = document.getElementById('category-list');
const recentLinksList = document.getElementById('recent-links');
const syncIndicator = document.getElementById('sync-indicator');
const syncText = document.getElementById('sync-text');

// State
let currentUrl = '';
let currentTitle = '';
let currentFavicon = '';
let categories = [];
let links = [];
let selectedCategories = ['Uncategorized']; // Default selection
let lastSyncTime = null;

// Initialize extension popup
document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab information
  chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
    if (tabs[0]) {
      currentUrl = tabs[0].url;
      currentTitle = tabs[0].title;
      currentFavicon = tabs[0].favIconUrl || `https://www.google.com/s2/favicons?domain=${new URL(currentUrl).hostname}&sz=128`;
      
      // Display current page info
      pageTitle.textContent = currentTitle;
      pageUrl.textContent = currentUrl;
      pageFavicon.src = currentFavicon;
      
      // Load data
      await loadData();
      
      // Display categories
      renderCategories();
      
      // Display recent links
      renderRecentLinks();
      
      // Check if current URL is already saved
      const alreadySaved = links.some(link => link.url === currentUrl);
      if (alreadySaved) {
        saveButton.textContent = 'Already Saved';
        saveButton.disabled = true;
      }
      
      // Check sync status
      updateSyncStatus();
    }
  });
  
  // Set up event listeners
  saveButton.addEventListener('click', saveCurrentPage);
  openAppButton.addEventListener('click', openWebApp);
});

// Load data from storage
async function loadData() {
  const data = await chrome.storage.sync.get(['links', 'categories', 'lastSyncTime']);
  links = data.links || [];
  categories = data.categories || [
    { id: "1", name: "Uncategorized", color: "oklch(0.5 0.15 260)" },
    { id: "2", name: "Work", color: "oklch(0.6 0.2 140)" },
    { id: "3", name: "Personal", color: "oklch(0.6 0.2 50)" }
  ];
  lastSyncTime = data.lastSyncTime || null;
}

// Save current page to LinkVault
async function saveCurrentPage() {
  try {
    // Show loading state
    saveButton.textContent = 'Saving...';
    saveButton.disabled = true;
    
    // Create new link object
    const domain = new URL(currentUrl).hostname.replace('www.', '');
    const newLink = {
      id: Date.now().toString(),
      url: currentUrl,
      title: currentTitle,
      favicon: currentFavicon,
      addedAt: Date.now(),
      tags: selectedCategories
    };
    
    // Add to links array
    links.unshift(newLink);
    
    // Save to storage
    await chrome.storage.sync.set({ links });
    
    // Update UI
    saveButton.textContent = 'Saved!';
    
    // Send message to background script to trigger sync
    chrome.runtime.sendMessage({ action: 'syncData' });
    
    // Update recent links
    renderRecentLinks();
    
    // Show syncing status
    showSyncingStatus();
    
    // Automatically close popup after a delay
    setTimeout(() => {
      window.close();
    }, 1500);
  } catch (error) {
    console.error('Error saving link:', error);
    saveButton.textContent = 'Error - Try Again';
    saveButton.disabled = false;
  }
}

// Render categories
function renderCategories() {
  categoryList.innerHTML = '';
  categories.forEach(category => {
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category-pill';
    if (selectedCategories.includes(category.name)) {
      categoryElement.classList.add('selected');
    }
    
    const colorDot = document.createElement('span');
    colorDot.className = 'category-color';
    colorDot.style.backgroundColor = category.color;
    
    categoryElement.appendChild(colorDot);
    categoryElement.appendChild(document.createTextNode(category.name));
    
    categoryElement.addEventListener('click', () => {
      toggleCategory(category.name);
    });
    
    categoryList.appendChild(categoryElement);
  });
}

// Toggle category selection
function toggleCategory(categoryName) {
  if (categoryName === 'Uncategorized' && selectedCategories.includes('Uncategorized') && selectedCategories.length === 1) {
    // Don't allow deselecting the last category
    return;
  }
  
  if (selectedCategories.includes(categoryName)) {
    selectedCategories = selectedCategories.filter(c => c !== categoryName);
    
    // If no categories selected, auto-select Uncategorized
    if (selectedCategories.length === 0) {
      selectedCategories = ['Uncategorized'];
    }
  } else {
    // If selecting a category other than Uncategorized and Uncategorized is currently
    // the only selected category, replace it
    if (selectedCategories.length === 1 && selectedCategories.includes('Uncategorized') && categoryName !== 'Uncategorized') {
      selectedCategories = [categoryName];
    } else {
      selectedCategories.push(categoryName);
    }
  }
  
  renderCategories();
}

// Render recent links
function renderRecentLinks() {
  recentLinksList.innerHTML = '';
  
  if (links.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No saved links yet';
    recentLinksList.appendChild(emptyMessage);
    return;
  }
  
  // Show only the 5 most recent links
  const recentLinks = links.slice(0, 5);
  
  recentLinks.forEach(link => {
    const linkElement = document.createElement('div');
    linkElement.className = 'link-item';
    linkElement.addEventListener('click', () => {
      chrome.tabs.create({ url: link.url });
    });
    
    const linkIcon = document.createElement('img');
    linkIcon.className = 'link-icon';
    linkIcon.src = link.favicon;
    linkIcon.alt = '';
    
    const linkDetails = document.createElement('div');
    linkDetails.className = 'link-details';
    
    const linkTitle = document.createElement('div');
    linkTitle.className = 'link-title';
    linkTitle.textContent = link.title;
    
    const linkUrl = document.createElement('div');
    linkUrl.className = 'link-url';
    linkUrl.textContent = link.url;
    
    linkDetails.appendChild(linkTitle);
    linkDetails.appendChild(linkUrl);
    
    linkElement.appendChild(linkIcon);
    linkElement.appendChild(linkDetails);
    
    recentLinksList.appendChild(linkElement);
  });
}

// Open the web app
function openWebApp() {
  chrome.tabs.create({ url: APP_URL });
}

// Update sync status display
function updateSyncStatus() {
  if (!lastSyncTime) {
    syncText.textContent = 'Not synced with mobile app';
    syncIndicator.classList.add('error');
    return;
  }
  
  const timeSinceSync = Date.now() - lastSyncTime;
  
  if (timeSinceSync < SYNC_INTERVAL) {
    syncText.textContent = 'Synced with mobile app';
    syncIndicator.classList.remove('error', 'syncing');
  } else {
    syncText.textContent = 'Sync needed with mobile app';
    syncIndicator.classList.add('error');
    syncIndicator.classList.remove('syncing');
    
    // Trigger background sync
    chrome.runtime.sendMessage({ action: 'syncData' });
  }
}

// Show syncing status
function showSyncingStatus() {
  syncText.textContent = 'Syncing with mobile app...';
  syncIndicator.classList.add('syncing');
  syncIndicator.classList.remove('error');
}