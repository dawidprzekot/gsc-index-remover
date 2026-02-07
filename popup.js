// ============================================
// GSC URL Remover - Popup Logic
// ============================================

let isRunning = false;

document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const urlsTextarea = document.getElementById('urls');
  const delayMinInput = document.getElementById('delayMin');
  const delayMaxInput = document.getElementById('delayMax');
  const urlCountEl = document.getElementById('urlCount');
  const statusBar = document.getElementById('statusBar');
  const statusIcon = document.getElementById('statusIcon');
  const statusText = document.getElementById('statusText');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const progressCount = document.getElementById('progressCount');
  const statusMsg = document.getElementById('statusMsg');

  // === Przywróć zapisany stan ===
  chrome.storage.local.get(['savedUrls', 'delayMin', 'delayMax', 'lastStatus', 'isProcessing'], function(result) {
    if (result.savedUrls) urlsTextarea.value = result.savedUrls;
    if (result.delayMin) delayMinInput.value = result.delayMin;
    if (result.delayMax) delayMaxInput.value = result.delayMax;
    updateUrlCount();

    // Jeśli proces nadal trwa (popup był zamknięty i otwarty ponownie)
    if (result.isProcessing && result.lastStatus) {
      restoreRunningState(result.lastStatus);
    } else if (result.lastStatus) {
      // Pokaż ostatni status (zakończenie lub błąd)
      const ls = result.lastStatus;
      if (ls.action === 'completed') {
        showStatusMsg('success', `✅ Ostatni proces zakończony! Wysłano ${ls.successCount} z ${ls.total} URL-i.`);
      } else if (ls.action === 'error') {
        showStatusMsg('error', `❌ Ostatni błąd: ${ls.message}`);
      }
    }
  });

  // === URL count + autosave ===
  urlsTextarea.addEventListener('input', function() {
    updateUrlCount();
    chrome.storage.local.set({ savedUrls: urlsTextarea.value });
  });

  delayMinInput.addEventListener('change', function() {
    chrome.storage.local.set({ delayMin: delayMinInput.value });
  });
  delayMaxInput.addEventListener('change', function() {
    chrome.storage.local.set({ delayMax: delayMaxInput.value });
  });

  function updateUrlCount() {
    const urls = getUrls();
    urlCountEl.textContent = urls.length;
  }

  function getUrls() {
    return urlsTextarea.value.split('\n').map(u => u.trim()).filter(u => u.length > 0);
  }

  // === Start ===
  startBtn.addEventListener('click', async function() {
    const urls = getUrls();
    if (urls.length === 0) {
      showStatusMsg('error', '❌ Wklej przynajmniej jeden adres URL!');
      return;
    }

    let dMin = parseInt(delayMinInput.value) || 3;
    let dMax = parseInt(delayMaxInput.value) || 8;
    if (dMin > dMax) [dMin, dMax] = [dMax, dMin];

    // Sprawdź czy jesteśmy na właściwej stronie
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url || !tab.url.includes('search.google.com')) {
      showStatusMsg('error', '❌ Otwórz Google Search Console przed uruchomieniem!');
      return;
    }

    setRunningUI(true);
    hideStatusMsg();
    showProgress(0, urls.length, 'Rozpoczynam wysyłanie...');

    chrome.storage.local.set({ isProcessing: true, lastStatus: null });

    // Wyślij do content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'startSubmission',
      urls: urls,
      delayMin: dMin,
      delayMax: dMax
    });
  });

  // === Stop ===
  stopBtn.addEventListener('click', async function() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'stopSubmission' });
    }
    setRunningUI(false);
    chrome.storage.local.set({ isProcessing: false });
    showStatusMsg('info', '⏸ Proces zatrzymany.');
    statusBar.classList.remove('visible');
  });

  // === Odbiór wiadomości z content script ===
  chrome.runtime.onMessage.addListener(function(request) {
    if (request.action === 'updateProgress') {
      showProgress(request.current, request.total, `Przetwarzanie URL ${request.current}/${request.total}...`);
      showStatusMsg('info',
        `🔄 Przetwarzanie...` +
        `<div class="current-url">📎 ${request.currentUrl}</div>`
      );
    } else if (request.action === 'completed') {
      setRunningUI(false);
      chrome.storage.local.set({ isProcessing: false });
      showProgress(request.total, request.total, 'Zakończono!', 'success');
      statusIcon.textContent = '✅';
      statusText.textContent = 'Zakończono!';
      showStatusMsg('success',
        `✅ Wysłano <strong>${request.successCount}</strong> z <strong>${request.total}</strong> URL-i.` +
        (request.failureCount > 0 ? `<br>⚠️ Niepowodzeń: ${request.failureCount}` : '')
      );
    } else if (request.action === 'error') {
      setRunningUI(false);
      chrome.storage.local.set({ isProcessing: false });
      showStatusMsg('error', `❌ Błąd: ${request.message}`);
      if (statusBar.classList.contains('visible')) {
        progressFill.className = 'progress-fill error';
      }
    }
  });

  // === UI Helpers ===
  function setRunningUI(running) {
    isRunning = running;
    if (running) {
      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      urlsTextarea.disabled = true;
      delayMinInput.disabled = true;
      delayMaxInput.disabled = true;
    } else {
      startBtn.classList.remove('hidden');
      stopBtn.classList.add('hidden');
      urlsTextarea.disabled = false;
      delayMinInput.disabled = false;
      delayMaxInput.disabled = false;
    }
  }

  function showProgress(current, total, msg, extraClass) {
    statusBar.classList.add('visible');
    statusIcon.textContent = '⏳';
    statusText.textContent = msg;
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    progressFill.style.width = pct + '%';
    progressFill.className = 'progress-fill' + (extraClass ? ' ' + extraClass : '');
    progressCount.textContent = `${current} / ${total}`;
  }

  function showStatusMsg(type, html) {
    statusMsg.className = `status-msg visible msg-${type}`;
    statusMsg.innerHTML = html;
  }

  function hideStatusMsg() {
    statusMsg.className = 'status-msg';
    statusMsg.innerHTML = '';
  }

  function restoreRunningState(lastStatus) {
    setRunningUI(true);
    if (lastStatus.action === 'updateProgress') {
      showProgress(lastStatus.current, lastStatus.total, `Przetwarzanie URL ${lastStatus.current}/${lastStatus.total}...`);
      showStatusMsg('info',
        `🔄 Proces trwa (popup został ponownie otwarty)` +
        `<div class="current-url">📎 ${lastStatus.currentUrl}</div>`
      );
    }
  }
});
