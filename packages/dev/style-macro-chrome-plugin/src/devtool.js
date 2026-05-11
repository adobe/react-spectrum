chrome.devtools.panels.elements.createSidebarPane('Style Macros', sidebar => {
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

  // Track mutation observer for selected element
  let currentObserver = null;
  let currentElementId = null;

  // Listen for messages from content script (via background script)
  backgroundPageConnection.onMessage.addListener(message => {
    debugLog('Message from background:', message);

    if (message.action === 'stylemacro-class-changed') {
      debugLog('Received stylemacro-class-changed notification for element:', message.elementId);
      // Only update if the changed element is the one we're currently watching
      if (message.elementId === currentElementId) {
        debugLog('Class changed on watched element, updating panel...');
        update();
      }
    }
  });

  // Get all static macro data in one eval (from CSS custom properties on $0).
  // Uses the element's window so iframes work correctly. Value is plain JSON.
  function getMacroDataStaticBatch(hashes) {
    if (hashes.length === 0) {
      return Promise.resolve([]);
    }
    return new Promise(resolve => {
      const hashesJson = JSON.stringify(hashes);
      const staticEval = `
(function () {
  var el = $0;
  if (!el) return [];
  var w = (el.ownerDocument && el.ownerDocument.defaultView) || window;
  var s = w.getComputedStyle(el);
  var hashes = ${hashesJson};
  return hashes.map(function (h) {
    var raw = s.getPropertyValue("--macro-data-" + h).trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  });
})();
      `.trim();
      chrome.devtools.inspectedWindow.eval(staticEval, results => {
        resolve(Array.isArray(results) ? results : []);
      });
    });
  }

  // Get all dynamic macro data in one eval. Uses $0's window (correct for iframes).
  // Reads from (element's document defaultView).__styleMacroDynamic__.map.
  function getMacroDataDynamicBatch(hashes) {
    if (hashes.length === 0) {
      return Promise.resolve([]);
    }
    return new Promise(resolve => {
      const hashesJson = JSON.stringify(hashes);
      const dynamicEval = `
(function () {
  var el = $0;
  var w = (el && el.ownerDocument && el.ownerDocument.defaultView) || window;
  var g = w && w.__styleMacroDynamic__;
  if (!g || !g.map) return [];
  var hashes = ${hashesJson};
  return hashes.map(function (h) {
    return g.map["-macro-dynamic-" + h] || null;
  });
})();
      `.trim();
      chrome.devtools.inspectedWindow.eval(dynamicEval, results => {
        resolve(Array.isArray(results) ? results : []);
      });
    });
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
    chrome.devtools.inspectedWindow.eval(
      `
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
    `,
      (result, isException) => {
        if (isException) {
          debugLog('Error setting up mutation observer:', result);
        } else if (result) {
          currentElementId = result;
          currentObserver = true; // Just track that we have an observer
          debugLog('Started observing element:', currentElementId);
        }
      }
    );
  };

  let update = () => {
    debugLog('Starting update...');
    chrome.devtools.inspectedWindow.eval('$0.getAttribute("class")', className => {
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

        // Get macro data: static from CSS custom properties on $0, dynamic from element's window.__styleMacroDynamic__.map
        debugLog(
          'Waiting for',
          staticMacroHashes.length,
          'static +',
          dynamicMacroHashes.length,
          'dynamic macros...'
        );
        let [staticResults, dynamicResults] = await Promise.all([
          getMacroDataStaticBatch(staticMacroHashes),
          getMacroDataDynamicBatch(dynamicMacroHashes)
        ]);
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
});
