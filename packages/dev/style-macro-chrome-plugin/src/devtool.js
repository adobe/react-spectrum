
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
    type: 'stylemacro-init',
    tabId: chrome.devtools.inspectedWindow.tabId
  });
  debugLog('Init message sent to background');

  // Store macro data directly in DevTools
  const macroData = new Map();

  // Track mutation observer for selected element
  let currentObserver = null;
  let currentElementId = null;

  // Listen for messages from content script (via background script)
  backgroundPageConnection.onMessage.addListener((message) => {
    debugLog('Message from background:', message);

    if (message.action === 'stylemacro-update-macros') {
      debugLog('Received stylemacro-update-macros for hash:', message.hash);
      // Store the macro data directly in DevTools
      macroData.set(message.hash, {
        loc: message.loc,
        style: message.style
      });
      debugLog('Stored macro data, total macros:', macroData.size);
      // Refresh the panel to show updated data
      update();
    } else if (message.action === 'stylemacro-class-changed') {
      debugLog('Received stylemacro-class-changed notification for element:', message.elementId);
      // Only update if the changed element is the one we're currently watching
      if (message.elementId === currentElementId) {
        debugLog('Class changed on watched element, updating panel...');
        update();
      }
    }
  });

  // Get macro data from local storage
  const getDynamicMacroData = (hash) => {
    debugLog('Looking up dynamic macro with hash:', hash);
    const data = macroData.get(hash);
    debugLog('Found data:', !!data);
    return data || null;
  };

  function getMacroData(className) {
    let promise = new Promise((resolve) => {
      debugLog('Getting macro data for:', className);
      chrome.devtools.inspectedWindow.eval(`window.getComputedStyle($0).getPropertyValue("--macro-data-${className}")`, (style) => {
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
        if (!element.__devtoolsId) {
          element.__devtoolsId = 'dt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        }

        const elementId = element.__devtoolsId;

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
                action: 'stylemacro-class-changed',
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

        // Get static macro data (async from CSS)
        let staticMacros = staticMacroHashes.map(macro => getMacroData(macro));

        debugLog('Waiting for', staticMacros.length, 'static macros...');
        let staticResults = await Promise.all(staticMacros);

        // Get dynamic macro data (sync from local storage)
        let dynamicResults = dynamicMacroHashes.map(hash => getDynamicMacroData(hash));

        // Combine results
        let results = [...staticResults, ...dynamicResults];
        debugLog('Results:', results);

        // Filter out null results (missing data)
        results = results.filter(r => r != null);
        debugLog('Filtered results:', results);

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

  // Cleanup stale macro data every 5 minutes
  const CLEANUP_INTERVAL = 1000 * 60 * 5;
  setInterval(() => {
    if (macroData.size === 0) {
      return;
    }

    debugLog('Running macro data cleanup, checking', macroData.size, 'macros...');
    const hashes = Array.from(macroData.keys());

    // Check all hashes in a single eval for efficiency
    const checkScript = `
      (function() {
        const hashes = ${JSON.stringify(hashes)};
        const results = {};
        for (const hash of hashes) {
          results[hash] = !!document.querySelector('.-macro-dynamic-' + hash);
        }
        return results;
      })();
    `;

    chrome.devtools.inspectedWindow.eval(checkScript, (results, isException) => {
      if (isException) {
        debugLog('Error during cleanup:', results);
        return;
      }

      let removedCount = 0;
      for (const hash in results) {
        if (!results[hash]) {
          debugLog('Removing stale macro:', hash);
          macroData.delete(hash);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        debugLog(`Cleaned up ${removedCount} stale macro(s). Remaining: ${macroData.size}`);
      } else {
        debugLog('No stale macros found.');
      }
    });
  }, CLEANUP_INTERVAL);
});
