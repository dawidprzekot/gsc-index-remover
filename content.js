// ============================================
// GSC URL Remover - Content Script
// Automatyzacja usuwania URL z Google Search Console
// ============================================

let isProcessing = false;
let shouldStop = false;
let currentUrlIndex = 0;
let urls = [];
let delayMin = 3;
let delayMax = 8;

// Nasłuchuj wiadomości z popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'startSubmission') {
    urls = request.urls;
    delayMin = request.delayMin || 3;
    delayMax = request.delayMax || 8;
    currentUrlIndex = 0;
    shouldStop = false;
    startProcessing();
  } else if (request.action === 'stopSubmission') {
    shouldStop = true;
    isProcessing = false;
  }
});

async function startProcessing() {
  if (isProcessing) return;
  isProcessing = true;

  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < urls.length; i++) {
    if (shouldStop) break;

    currentUrlIndex = i;
    const url = urls[i];

    // Powiadom o postępie (background zapisze do storage)
    chrome.runtime.sendMessage({
      action: 'updateProgress',
      current: i + 1,
      total: urls.length,
      currentUrl: url
    });

    try {
      const success = await submitUrl(url);
      
      if (success) {
        successCount++;
      } else {
        failureCount++;
      }

      // Czekaj przed następnym URLem (losowy delay z zakresu)
      if (i < urls.length - 1 && !shouldStop) {
        const waitMs = randomDelay(delayMin, delayMax);
        const waitSec = (waitMs / 1000).toFixed(1);
        console.log(`⏳ Czekam ${waitSec}s przed kolejnym URL...`);
        
        // Czekaj w małych kawałkach żeby sprawdzać shouldStop
        let waited = 0;
        while (waited < waitMs && !shouldStop) {
          await sleep(Math.min(500, waitMs - waited));
          waited += 500;
        }
      }
    } catch (error) {
      console.error('Błąd podczas przetwarzania URL:', url, error);
      failureCount++;
    }
  }

  isProcessing = false;

  // Powiadom o zakończeniu
  if (!shouldStop) {
    chrome.runtime.sendMessage({
      action: 'completed',
      successCount: successCount,
      failureCount: failureCount,
      total: urls.length
    });
  }

  // Wyczyść stan przetwarzania
  chrome.storage.local.set({ isProcessing: false });
}

async function submitUrl(url) {
  try {
    // Krok 1: Kliknij "Nowa prośba"
    console.log('Krok 1: Szukam przycisku "Nowa prośba"...');
    const newRequestButton = await findAndClickButton('Nowa prośba');
    if (!newRequestButton) {
      console.error('Nie znaleziono przycisku "Nowa prośba"');
      return false;
    }
    await sleep(1000);

    // Krok 2: Znajdź pole input i wpisz URL
    console.log('Krok 2: Wpisuję URL do pola...');
    const inputField = document.querySelector('input[placeholder="Wpisz URL"]');
    if (!inputField) {
      console.error('Nie znaleziono pola input dla URL');
      return false;
    }

    // Wyczyść pole i wpisz nowy URL
    inputField.value = '';
    inputField.focus();
    
    // Symuluj wpisywanie (ważne dla walidacji Google)
    for (let char of url) {
      inputField.value += char;
      inputField.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(10);
    }
    
    // Dodatkowe eventy
    inputField.dispatchEvent(new Event('change', { bubbles: true }));
    inputField.dispatchEvent(new Event('blur', { bubbles: true }));
    
    await sleep(500);

    // Krok 3: Kliknij "Następne"
    console.log('Krok 3: Klikam "Następne"...');
    const nextButton = await findAndClickButton('Następne');
    if (!nextButton) {
      console.error('Nie znaleziono przycisku "Następne"');
      return false;
    }
    await sleep(1500);

    // Krok 4: Kliknij "Prześlij prośbę"
    console.log('Krok 4: Klikam "Prześlij prośbę"...');
    const submitButton = await findAndClickButton('Prześlij prośbę');
    if (!submitButton) {
      console.error('Nie znaleziono przycisku "Prześlij prośbę"');
      return false;
    }
    
    await sleep(1000);

    console.log('✅ URL wysłany pomyślnie:', url);
    return true;

  } catch (error) {
    console.error('Błąd podczas wysyłania URL:', url, error);
    return false;
  }
}

async function findAndClickButton(buttonText) {
  const maxAttempts = 15;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    console.log(`Próba ${attempt + 1}/${maxAttempts} znalezienia przycisku: "${buttonText}"`);
    
    // Metoda 1: Szukaj po jsname="Hf7sUe" dla "Nowa prośba"
    if (buttonText === 'Nowa prośba') {
      const nowaProsbaBtns = document.querySelectorAll('[jsname="Hf7sUe"]');
      for (let btn of nowaProsbaBtns) {
        if (btn.textContent.includes(buttonText)) {
          console.log('Znaleziono przycisk przez jsname="Hf7sUe"');
          btn.click();
          return btn;
        }
      }
    }
    
    // Metoda 2: Szukaj span z klasami RveJvd snByac
    let spans = document.querySelectorAll('span.RveJvd.snByac');
    for (let span of spans) {
      if (span.textContent.trim() === buttonText) {
        console.log('Znaleziono span z tekstem, szukam klikalnego rodzica...');
        let clickableElement = span.closest('[role="button"], button, [jsaction*="click"]');
        if (clickableElement) {
          console.log('Klikam w rodzica:', clickableElement);
          clickableElement.click();
          return clickableElement;
        }
        console.log('Klikam bezpośrednio w span');
        span.click();
        return span;
      }
    }

    // Metoda 3: Szukaj po klasach CwaK9
    const containers = document.querySelectorAll('.CwaK9');
    for (let container of containers) {
      if (container.textContent.trim() === buttonText) {
        console.log('Znaleziono przez .CwaK9, szukam rodzica...');
        let clickableElement = container.closest('[role="button"], button, [jsaction*="click"]');
        if (clickableElement) {
          console.log('Klikam w rodzica:', clickableElement);
          clickableElement.click();
          return clickableElement;
        }
      }
    }

    // Metoda 4: XPath
    const xpath = `//span[@class='RveJvd snByac' and normalize-space(text())='${buttonText}']`;
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    if (result.singleNodeValue) {
      console.log('Znaleziono przez XPath');
      let element = result.singleNodeValue;
      let clickableElement = element.closest('[role="button"], button, [jsaction*="click"]');
      if (clickableElement) {
        console.log('Klikam w rodzica:', clickableElement);
        clickableElement.click();
        return clickableElement;
      }
      element.click();
      return element;
    }

    // Metoda 5: Wszystkie przyciski zawierające tekst
    const allButtons = document.querySelectorAll('button, [role="button"]');
    for (let btn of allButtons) {
      if (btn.textContent.includes(buttonText) && btn.offsetParent !== null) {
        console.log('Znaleziono przez loop wszystkich przycisków');
        btn.click();
        return btn;
      }
    }

    await sleep(400);
  }

  console.error(`Nie znaleziono przycisku: "${buttonText}" po ${maxAttempts} próbach`);
  return null;
}

// Losowe opóźnienie z zakresu (w ms)
function randomDelay(minSec, maxSec) {
  return Math.round((Math.random() * (maxSec - minSec) + minSec) * 1000);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

console.log('🔍 GSC URL Remover - content script załadowany');
