
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
  if (message && typeof message === 'object') {
    if (message.action === 'stylemacro-update-macros') {
      debugLog('Forwarding stylemacro-update-macros for hash:', message.hash);

      // if this script is run multiple times on the page, then only handle it once
      event.stopImmediatePropagation();
      event.stopPropagation();

      // Forward message directly to background script (which forwards to DevTools)
      try {
        chrome.runtime.sendMessage({
          action: 'stylemacro-update-macros',
          hash: message.hash,
          loc: message.loc,
          style: message.style
        });
      } catch (err) {
        debugLog('Failed to send stylemacro-update-macros message:', err);
      }
    } else if (message.action === 'stylemacro-class-changed') {
      // Forward class-changed messages from page context to background script
      debugLog('Forwarding stylemacro-class-changed for element:', message.elementId);

      // if this script is run multiple times on the page, then only handle it once
      event.stopImmediatePropagation();
      event.stopPropagation();

      try {
        chrome.runtime.sendMessage({
          action: 'stylemacro-class-changed',
          elementId: message.elementId
        });
      } catch (err) {
        debugLog('Failed to send stylemacro-class-changed message:', err);
      }
    }
  }
});

// No longer need to listen for get-macro requests or manage cleanup
// since macro data is stored directly in DevTools

