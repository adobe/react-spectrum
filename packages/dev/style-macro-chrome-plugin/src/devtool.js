
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
    // Clean up observer when connection is lost
    disconnectObserver();
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

  // Track mutation observer for selected element
  let currentObserver = null;
  let currentElementId = null;

  // Listen for responses from content script (via background script)
  backgroundPageConnection.onMessage.addListener((message) => {
    debugLog('Message from background:', message);

    if (message.action === 'macro-response') {
      debugLog('Received macro-response for hash:', message.hash, 'Has data:', !!message.data);
      debugLog('Pending queries has hash:', pendingQueries.has(message.hash), 'Total pending:', pendingQueries.size);
      const resolve = pendingQueries.get(message.hash);
      if (resolve) {
        debugLog('Resolving promise for hash:', message.hash, 'with data:', message.data);
        resolve(message.data);
        pendingQueries.delete(message.hash);
      } else {
        debugLog('WARNING: No pending query found for hash:', message.hash);
      }
    } else if (message.action === 'update-macros') {
      debugLog('Received update-macros, refreshing...');
      update();
    } else if (message.action === 'class-changed') {
      debugLog('Received class-changed notification for element:', message.elementId);
      // Only update if the changed element is the one we're currently watching
      if (message.elementId === currentElementId) {
        debugLog('Class changed on watched element, updating panel...');
        update();
      }
    }
  });

  // Query macro data from content script via background script
  const queryMacro = (hash) => {
    debugLog('Querying macro with hash:', hash);
    return new Promise((resolve) => {
      pendingQueries.set(hash, resolve);
      debugLog('Added to pendingQueries, total pending:', pendingQueries.size);

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
          debugLog('TIMEOUT: Query timeout for hash:', hash, 'Resolving to null');
          pendingQueries.delete(hash);
          resolve(null);
        } else {
          debugLog('Timeout fired for hash:', hash, 'but query already resolved');
        }
      }, 1000);
    });
  };

  function getMacroData(className) {
    let promise = new Promise((resolve) => {
      debugLog('Getting macro data for:', className);
      chrome.devtools.inspectedWindow.eval('window.getComputedStyle($0).getPropertyValue("--macro-data")', (style) => {
        debugLog('Got style:', style);
        resolve(style ? JSON.parse(style) : null);
      });
    });
    return promise;
  }

  // Function to disconnect the current observer
  const disconnectObserver = () => {
    if (currentObserver) {
      chrome.devtools.inspectedWindow.eval(`
        if (window.__styleMacroObserver) {
          window.__styleMacroObserver.disconnect();
          window.__styleMacroObserver = null;
        }
      `);
      debugLog('Disconnected mutation observer for element:', currentElementId);
      currentObserver = null;
      currentElementId = null;
    }
  };

  // Function to start observing the currently selected element
  const startObserving = () => {
    // First disconnect any existing observer
    disconnectObserver();

    // Generate a unique ID for the current element
    chrome.devtools.inspectedWindow.eval(`
      (function() {
        const element = $0;
        if (!element || !element.classList) {
          return null;
        }

        // Generate a unique ID if element doesn't have one
        if (!element.hasAttribute('data-devtools-id')) {
          element.setAttribute('data-devtools-id', 'dt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9));
        }

        const elementId = element.getAttribute('data-devtools-id');

        // Create mutation observer
        if (window.__styleMacroObserver) {
          window.__styleMacroObserver.disconnect();
        }

        window.__styleMacroObserver = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              // Notify DevTools that the class has changed via window.postMessage
              // (chrome.runtime is not available in page context)
              window.postMessage({
                action: 'class-changed',
                elementId: elementId
              }, '*');
              break;
            }
          }
        });

        window.__styleMacroObserver.observe(element, {
          attributes: true,
          attributeFilter: ['class']
        });

        return elementId;
      })();
    `, (result, isException) => {
      if (isException) {
        debugLog('Error setting up mutation observer:', result);
      } else if (result) {
        currentElementId = result;
        currentObserver = true; // Just track that we have an observer
        debugLog('Started observing element:', currentElementId);
      }
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

        let staticMacroHashes = [...className.matchAll(/-macro-static-([^\s]+)/g)].map(m => m[1]);
        let dynamicMacroHashes = [...className.matchAll(/-macro-dynamic-([^\s]+)/g)].map(m => m[1]);
        debugLog('Static macro hashes:', staticMacroHashes);
        debugLog('Dynamic macro hashes:', dynamicMacroHashes);

        let staticMacros = staticMacroHashes.map(macro => getMacroData(macro));
        let dynamicMacros = dynamicMacroHashes.map(macro => queryMacro(macro));

        debugLog('Waiting for', staticMacros.length, 'static and', dynamicMacros.length, 'dynamic macros...');
        let results = await Promise.all([...staticMacros, ...dynamicMacros]);
        debugLog('Results:', results);

        if (results.length === 0) {
          sidebar.setObject({});
        } else if (results.length === 1) {
          sidebar.setObject(results[0].style ?? {}, results[0].loc);
        } else {
          let seenProperties = new Set();
          for (let i = results.length - 1; i >= 0; i--) {
            for (let key in results[i].style) {
              if (seenProperties.has(key)) {
                delete results[i].style[key];
              } else {
                seenProperties.add(key);
              }
            }
          }

          let res = {};
          for (let result of results) {
            res[result.loc] = result.style;
          }
          sidebar.setObject(res);
        }
      })();
    });
  };

  chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
    debugLog('Element selection changed');
    // Start observing the newly selected element
    startObserving();
    // Update the panel with the new element's macros
    update();
  });

  // Initial observation when the panel is first opened
  startObserving();
});
