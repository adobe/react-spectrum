

chrome.devtools.panels.elements.createSidebarPane('Style Macros', (sidebar) => {
  sidebar.setObject({});
  let update = () => {
    chrome.devtools.inspectedWindow.eval('$0.getAttribute("class")', async (className) => {
      if (typeof className !== 'string') {
        sidebar.setObject({});
        return;
      }

      let macros = className.matchAll(/-macro\$([^\s]+)/g);
      let matches = [];
      for (let macro of macros) {
        await new Promise(resolve => {
          chrome.devtools.inspectedWindow.eval(`$0.ownerDocument.defaultView.__macros?.[${JSON.stringify(macro[1])}]`, (result, x) => {
            if (result) {
              matches.push(result);
            }
            resolve();
          });
        });
      }

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
    });
  };

  chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
    update();
  });

  chrome.runtime.onMessage.addListener(() => update());
});
