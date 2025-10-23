
chrome.devtools.panels.elements.createSidebarPane('Style Macros', (sidebar) => {
  sidebar.setObject({});

  // Helper function to log to both DevTools-for-DevTools console and inspected page console
  const debugLog = (...args) => {
    // console.log(...args); // Logs to DevTools-for-DevTools console
    // const message = args.map(arg =>
    //   typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    // ).join(' ');
    // chrome.devtools.inspectedWindow.eval(`console.log('[DevTools]', ${JSON.stringify(message)})`);
  };

  const backgroundPageConnection = chrome.runtime.connect({name: 'devtools-page'});

  // Monitor connection status
  backgroundPageConnection.onDisconnect.addListener(() => {
    debugLog('ERROR: Background connection disconnected!', chrome.runtime.lastError);
  });

  // Initialize connection with the background script
  debugLog('Initializing connection with tabId:', chrome.devtools.inspectedWindow.tabId);
  backgroundPageConnection.postMessage({
    type: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
  });
  debugLog('Init message sent to background');

  // Track pending queries for macro data
  const pendingQueries = new Map();

  // Listen for responses from content script (via background script)
  backgroundPageConnection.onMessage.addListener((message) => {
    debugLog('Message from background:', message);

    if (message.action === 'macro-response') {
      debugLog('Received macro-response for hash:', message.hash);
      const resolve = pendingQueries.get(message.hash);
      if (resolve) {
        resolve(message.data);
        pendingQueries.delete(message.hash);
      }
    } else if (message.action === 'update-macros') {
      debugLog('Received update-macros, refreshing...');
      update();
    }
  });

  // Query macro data from content script via background script
  const queryMacro = (hash) => {
    debugLog('Querying macro with hash:', hash);
    return new Promise((resolve) => {
      pendingQueries.set(hash, resolve);

      try {
        backgroundPageConnection.postMessage({
          type: 'query-macros',
          hash: hash
        });
        debugLog('Query message sent to background for hash:', hash);
      } catch (err) {
        debugLog('ERROR sending message:', err);
        pendingQueries.delete(hash);
        resolve(null);
        return;
      }

      // Timeout after 1 second
      setTimeout(() => {
        if (pendingQueries.has(hash)) {
          debugLog('Query timeout for hash:', hash);
          pendingQueries.delete(hash);
          resolve(null);
        }
      }, 1000);
    });
  };

  let update = () => {
    debugLog('Starting update...');
    chrome.devtools.inspectedWindow.eval('$0.getAttribute("class")', (className) => {
      debugLog('Got className:', className);

      // Handle the async operations outside the eval callback
      (async () => {
        if (typeof className !== 'string') {
          sidebar.setObject({});
          return;
        }

        let macros = className.matchAll(/-macro\$([^\s]+)/g);
        let matches = [];

        for (let macro of macros) {
          debugLog('Processing macro:', macro[1]);
          const result = await queryMacro(macro[1]);
          debugLog('Got result for macro:', macro[1], result ? 'found' : 'not found');
          if (result) {
            matches.push(result);
          }
        }

        debugLog('Total matches:', matches.length);

        if (matches.length === 0) {
          sidebar.setObject({});
        } else if (matches.length === 1) {
          sidebar.setObject(matches[0].style ?? {}, matches[0].loc);
        } else {
          let seenProperties = new Set();
          for (let i = matches.length - 1; i >= 0; i--) {
            for (let key in matches[i].style) {
              if (seenProperties.has(key)) {
                delete matches[i].style[key];
              } else {
                seenProperties.add(key);
              }
            }
          }

          let res = {};
          for (let match of matches) {
            res[match.loc] = match.style;
          }
          sidebar.setObject(res);
        }
      })();
    });
  };

  chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
    debugLog('Element selection changed');
    update();
  });
});
