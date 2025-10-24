
if (window.__macrosLoaded) {
  return;
}
window.__macrosLoaded = true;

let debugLog = (...args) => {
  // console.log('[Content Script]', ...args);
};

window.addEventListener('message', function (event) {
  // Only accept messages from the same frame
  if (event.source !== window) {
    return;
  }

  var message = event.data;

  // Only accept messages that we know are ours. Note that this is not foolproof
  // and the page can easily spoof messages if it wants to.
  if (message && typeof message === 'object' && message.action === 'update-macros') {
    let {hash, loc, style} = message;
    if (!window.__macros) {
      window.__macros = {};
    }

    // Update the specific macro without overwriting others
    window.__macros[hash] = {
      loc,
      style
    };

    debugLog('Updated macro:', hash, 'Total macros:', Object.keys(window.__macros).length);

    // if this script is run multiple times on the page, then only handle it once
    event.stopImmediatePropagation();
    event.stopPropagation();

    // Send message to background script (which forwards to DevTools)
    try {
      chrome.runtime.sendMessage({
        action: 'update-macros',
        ...message
      });
    } catch (err) {
      debugLog('Failed to send update-macros message:', err);
    }
  }
});

// Listen for requests from DevTools (via background script)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog('Received message:', message);

  if (message.action === 'get-macro') {
    const macroData = window.__macros?.[message.hash];
    debugLog('get-macro request for hash:', message.hash, 'Found:', !!macroData);
    debugLog('Available macros:', window.__macros ? Object.keys(window.__macros) : 'none');

    // Send response back through background script
    try {
      chrome.runtime.sendMessage({
        action: 'macro-response',
        hash: message.hash,
        data: macroData || null
      });
    } catch (err) {
      debugLog('Failed to send macro-response message:', err);
    }
  }
});

// Polling service to clean up stale macros
// Runs every 5 minutes to check if macro class names still exist on the page
const CLEANUP_INTERVAL = 1000 * 60 * 5; // 5 minutes

setInterval(() => {
  if (!window.__macros) {
    return;
  }

  const macroHashes = Object.keys(window.__macros);
  if (macroHashes.length === 0) {
    return;
  }

  let removedCount = 0;

  for (const hash of macroHashes) {
    // Check if any element with this macro class exists in the DOM
    const selector = `.-macro\\$${CSS.escape(hash)}`;
    const elementExists = document.querySelector(selector);

    if (!elementExists) {
      debugLog('Cleaning up stale macro:', hash, window.__macros[hash].style);
      delete window.__macros[hash];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    debugLog(`Cleaned up ${removedCount} stale macro(s). Remaining: ${Object.keys(window.__macros).length}`);
  }
}, CLEANUP_INTERVAL);

