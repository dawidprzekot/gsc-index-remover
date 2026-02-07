// ============================================
// GSC URL Remover - Background Service Worker
// Przechowuje stan i przekazuje wiadomości
// Dzięki temu automatyzacja działa nawet po
// zamknięciu popupu lub przełączeniu karty
// ============================================

// Nasłuchuj wiadomości z content script i popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  // Content script -> zapisz stan do storage (popup odczyta)
  if (message.action === 'updateProgress' || message.action === 'completed' || message.action === 'error') {
    chrome.storage.local.set({ lastStatus: message });
  }
  
  // Content script informuje o zakończeniu
  if (message.action === 'completed') {
    // Wyświetl badge na ikonce
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#1e8e3e' });
    
    // Ukryj badge po 10 sekundach
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 10000);
  }
  
  // Content script informuje o trwającym procesie
  if (message.action === 'updateProgress') {
    chrome.action.setBadgeText({ text: `${message.current}` });
    chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });
  }
  
  // Content script informuje o błędzie
  if (message.action === 'error') {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#d93025' });
    
    setTimeout(() => {
      chrome.action.setBadgeText({ text: '' });
    }, 10000);
  }

  return true;
});
