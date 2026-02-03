
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

  // Track mutation observer for selected element
  let currentObserver = null;
  let currentElementId = null;

  // Listen for messages from content script (via background script)
  backgroundPageConnection.onMessage.addListener((message) => {
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

  // Get macro data from the CSS custom property (works for both static and dynamic)
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

        // Get macro data for both static and dynamic (both read from inspected element)
        let allMacros = [...staticMacroHashes, ...dynamicMacroHashes].map(hash => getMacroData(hash));

        debugLog('Waiting for', allMacros.length, 'macros...');
        let results = await Promise.all(allMacros);
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
    debugLog('Running macro data cleanup...');

    // Remove unused dynamic macro CSS rules from the style tag
    const cleanupScript = `
      (function() {
        const styleTag = document.getElementById('__style-macro-data__');
        if (!styleTag || !styleTag.sheet) {
          return { found: false, removed: 0 };
        }

        const sheet = styleTag.sheet;
        let removedCount = 0;
        const rulesToRemove = [];

        // Collect rules that need to be removed
        for (let i = 0; i < sheet.cssRules.length; i++) {
          const rule = sheet.cssRules[i];
          if (rule.selectorText && rule.selectorText.startsWith('.-macro-dynamic-')) {
            // Check if this class is used anywhere in the DOM
            const className = rule.selectorText.substring(1); // Remove leading dot
            const isUsed = document.querySelector('.' + CSS.escape(className)) !== null;

            if (!isUsed) {
              rulesToRemove.push(i);
            }
          }
        }

        // Remove rules in reverse order to maintain correct indices
        for (let i = rulesToRemove.length - 1; i >= 0; i--) {
          sheet.deleteRule(rulesToRemove[i]);
          removedCount++;
        }

        return {
          found: true,
          removed: removedCount,
          remaining: sheet.cssRules.length
        };
      })();
    `;

    chrome.devtools.inspectedWindow.eval(cleanupScript, (result, isException) => {
      if (isException) {
        debugLog('Error during cleanup:', result);
        return;
      }

      if (!result.found) {
        debugLog('No macro data style tag found.');
      } else if (result.removed > 0) {
        debugLog(`Cleaned up ${result.removed} stale macro(s). Remaining: ${result.remaining}`);
      } else {
        debugLog('No stale macros found.');
      }
    });
  }, CLEANUP_INTERVAL);
});
