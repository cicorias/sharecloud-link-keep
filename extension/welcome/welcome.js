// LinkVault Welcome Page Script

document.addEventListener('DOMContentLoaded', () => {
  const openAppButton = document.getElementById('open-app-button');
  
  // Set up click handler for the open app button
  openAppButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Open the main LinkVault web app
    chrome.tabs.create({ url: 'https://your-linkvault-app-url.com' });
  });
});