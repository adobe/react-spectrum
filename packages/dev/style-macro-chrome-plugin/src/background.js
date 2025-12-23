// Keep track of DevTools connections per tab
const devtoolsConnections = new Map();

// Listen for connections from DevTools
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'devtools-page') {
    let tabId;

    // Listen for messages from DevTools
    const messageListener = (message) => {
      if (message.type === 'init') {
        tabId = message.tabId;
        devtoolsConnections.set(tabId, port);
        console.log(`[Background] DevTools connected for tab ${tabId}`);
      } else if (message.type === 'query-macros') {
        console.log(`[Background] Forwarding query-macros to content script, hash: ${message.hash}, tabId: ${tabId}`);
        // Forward query to content script
        chrome.tabs.sendMessage(tabId, {
          action: 'get-macro',
          hash: message.hash
        }).catch(err => {
          console.error('[Background] Error sending message to content script:', err);
        });
      }
    };

    port.onMessage.addListener(messageListener);

    // Clean up when DevTools disconnects
    port.onDisconnect.addListener(() => {
      if (tabId) {
        devtoolsConnections.delete(tabId);
        console.log(`DevTools disconnected for tab ${tabId}`);
      }
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab?.id;

  if (!tabId) {
    return;
  }

  // Forward messages from content script to DevTools
  if (message.action === 'update-macros' || message.action === 'macro-response' || message.action === 'class-changed') {
    console.log(`[Background] Forwarding ${message.action} from content script to DevTools, tabId: ${tabId}`);
    const devtoolsPort = devtoolsConnections.get(tabId);
    if (devtoolsPort) {
      devtoolsPort.postMessage(message);
    } else {
      console.warn(`[Background] No DevTools connection found for tab ${tabId}`);
    }
  }

  return false; // Don't keep channel open
});

