# style-macro-chrome-plugin

This is a chrome plugin to assist in debugging the styles applied by our Style Macro.

## Local development

From the root of our monopackage, run

```
yarn
yarn workspace style-macro-chrome-plugin start
// or build to avoid refresh bugs in HMR
yarn workspace style-macro-chrome-plugin build
```

This will create a dist directory in the directory `packages/dev/style-macro-chrome-plugin` which will update anytime the code changes and results in a rebuild.

Next, open Chrome and go to [chrome://extensions/](chrome://extensions/).

Load an unpacked extension, it's a button in the top left, and navigate to the dist directory.

The extension is now registered in Chrome and you can go to storybook or docs, wherever you are working.

Inspect an element on the page to open dev tools and go to the Style Macro panel.

## Troubleshooting

If the panel isn't updating with styles, try closing the dev tools and reopening it.

If the extension doesn't appear to have the latest code, try closing the dev tools and reopening it. You may also want to go to the extensions page and either "refresh" or remove and re-add the extension.

If every tab you have open (or many of them) reload when you make local changes to the extension, then go into the extension settings and limit it to `localhost` or something appropriate.

## ToDos

- [ ] Work with RSC
- [ ] Would be pretty cool if we could match a style condition to trigger it, like hover
- [ ] Eventually add to https://github.com/astahmer/atomic-css-devtools ??
- [ ] Our own UI ??
- [ ] Filtering
- [ ] Resolve css variables inline
- [ ] Link to file on the side instead of grouping by filename?
- [ ] Add classname that is applying style?
- [ ] Work in MFE's

## Extension Architecture

This extension uses Chrome's standard extension architecture with three main components that communicate via message passing.

### Components

#### 1. **Page Context** (style-macro runtime + MutationObserver)
- **Location**: Runs in the actual page's JavaScript context
- **Responsibility**:
  - Generates macro metadata (hash, location, styles) when style macro is evaluated
  - Hosts MutationObserver that watches selected element for className changes
- **Storage**: None - static macros embed data in CSS, dynamic macros send messages
- **Communication**:
  - For static macros: Embeds data in CSS custom property `--macro-data`
  - For dynamic macros: Sends `window.postMessage({ action: 'update-macros', hash, loc, style })` to content script
  - For className changes: Sends `window.postMessage({ action: 'class-changed', elementId })` to content script

#### 2. **Content Script** (`content-script.js`)
- **Location**: Isolated sandboxed environment injected into the page
- **Scope**: Handles dynamic macros only (static macros are read directly from CSS)
- **Responsibility**:
  - Listens for `window.postMessage({ action: 'update-macros' })` from the page and stores dynamic macro data in its own `window.__macros`
  - Forwards `window.postMessage({ action: 'class-changed' })` from page to background script
  - Responds to queries from DevTools (via background script), with retry logic to handle race conditions
  - Cleans up stale macros every 5 minutes
- **Storage**: `window.__macros[hash] = { loc: string, style: object }` (in content script context, not page context)
- **Race Condition Handling**: When queried for a hash that doesn't exist yet, polls every 50ms for up to 500ms before responding with null
- **Communication**:
  - Receives:
    - `window.postMessage({ action: 'update-macros' })` from page
    - `window.postMessage({ action: 'class-changed' })` from page
    - `chrome.runtime.onMessage({ action: 'get-macro' })` from background
  - Sends:
    - `chrome.runtime.sendMessage({ action: 'update-macros' })` to background
    - `chrome.runtime.sendMessage({ action: 'class-changed' })` to background
    - `chrome.runtime.sendMessage({ action: 'macro-response' })` to background

#### 3. **Background Script** (`background.js`)
- **Location**: Service worker (isolated context)
- **Responsibility**: Acts as a message broker between DevTools and content scripts
- **State**: Maintains a map of DevTools connections per tab
- **Communication**:
  - Receives:
    - `chrome.runtime.onConnect({ name: 'devtools-page' })` from DevTools
    - `port.onMessage({ type: 'init' })` from DevTools
    - `port.onMessage({ type: 'query-macros' })` from DevTools
    - `chrome.runtime.onMessage({ action: 'update-macros' })` from content script
    - `chrome.runtime.onMessage({ action: 'macro-response' })` from content script
    - `chrome.runtime.onMessage({ action: 'class-changed' })` from content script
  - Sends:
    - `chrome.tabs.sendMessage({ action: 'get-macro' })` to content script
    - `port.postMessage({ action: 'update-macros' })` to DevTools
    - `port.postMessage({ action: 'macro-response' })` to DevTools
    - `port.postMessage({ action: 'class-changed' })` to DevTools

#### 4. **DevTools Panel** (`devtool.js`)
- **Location**: DevTools sidebar panel context
- **Responsibility**:
  - Extracts macro class names from selected element:
    - Static macros: `-macro-static-{hash}` → retrieves data via CSS custom properties (`--macro-data`)
    - Dynamic macros: `-macro-dynamic-{hash}` → queries data via content script (responds to changing conditions)
  - Queries for macro data using appropriate method based on macro type
  - Displays style information in sidebar
  - **Automatic Updates**: Sets up a MutationObserver on the selected element to detect className changes and automatically refreshes the panel
- **Mutation Observer**:
  - Created when an element is selected via `chrome.devtools.panels.elements.onSelectionChanged`
  - Watches the selected element's `class` attribute for changes
  - Disconnects when:
    - A new element is selected
    - The DevTools connection is closed
  - Triggers automatic panel refresh when className changes
- **Communication**:
  - Receives:
    - `port.onMessage({ action: 'macro-response' })` from background
    - `port.onMessage({ action: 'update-macros' })` from background
    - `port.onMessage({ action: 'class-changed' })` from background (triggers refresh)
  - Sends:
    - `chrome.runtime.connect({ name: 'devtools-page' })` to establish connection
    - `port.postMessage({ type: 'init' })` to background
    - `port.postMessage({ type: 'query-macros' })` to background (for dynamic macros only)

### Message Flow Diagrams

#### Flow 1a: Static Macro Lookup (DevTools reads CSS)

Static macros are generated when style macro conditions don't change at runtime. The macro data is embedded directly into the CSS as a custom property.

```
┌─────────────────┐
│ DevTools Panel  │ User selects element with -macro-static-{hash} class
└────────┬────────┘
         │ Read CSS custom property --macro-data via getComputedStyle()
         ↓
┌─────────────────┐
│ Page DOM/CSS    │ Returns macro data from CSS
└────────┬────────┘
         │ { loc: "...", style: {...} }
         ↓
┌─────────────────┐
│ DevTools Panel  │ Parses and displays in sidebar
└─────────────────┘
```

#### Flow 1b: Dynamic Macro Updates (Page → DevTools)

Dynamic macros are generated when style macro conditions can change at runtime. Updates are sent via message passing.

```
┌─────────────────┐
│ Page Context    │
│ (style-macro)   │
└────────┬────────┘
         │ window.postMessage({ action: 'update-macros', hash, loc, style })
         ↓
┌─────────────────┐
│ Content Script  │ Stores in window.__macros[hash]
└────────┬────────┘
         │ chrome.runtime.sendMessage({ action: 'update-macros', ... })
         ↓
┌─────────────────┐
│ Background      │ Looks up DevTools connection for tabId
└────────┬────────┘
         │ port.postMessage({ action: 'update-macros', ... })
         ↓
┌─────────────────┐
│ DevTools Panel  │ Triggers sidebar refresh
└─────────────────┘
```

#### Flow 2: Query Macro Data (DevTools → Content Script → DevTools)

```
┌─────────────────┐
│ DevTools Panel  │ User selects element with -macro-dynamic-{hash} class
└────────┬────────┘
         │ port.postMessage({ type: 'query-macros', hash })
         ↓
┌─────────────────┐
│ Background      │ Forwards to content script in specified tab
└────────┬────────┘
         │ chrome.tabs.sendMessage(tabId, { action: 'get-macro', hash })
         ↓
┌─────────────────┐
│ Content Script  │ Checks window.__macros[hash]
│                 │ • If found → responds immediately
│                 │ • If not found → polls every 50ms (max 500ms)
│                 │   to handle race with window.postMessage
└────────┬────────┘
         │ chrome.runtime.sendMessage({ action: 'macro-response', hash, data })
         ↓
┌─────────────────┐
│ Background      │ Looks up DevTools connection
└────────┬────────┘
         │ port.postMessage({ action: 'macro-response', hash, data })
         ↓
┌─────────────────┐
│ DevTools Panel  │ Resolves Promise, updates sidebar
└─────────────────┘
```

#### Flow 3: Macro Cleanup (Automated)

```
┌─────────────────┐
│ Content Script  │ Every 5 minutes
└────────┬────────┘
         │ For each hash in window.__macros:
         │   Check if document.querySelector(`.-macro-dynamic-${hash}`) exists
         │   If not found, delete window.__macros[hash]
         ↓
┌─────────────────┐
│ Garbage         │ Stale macros removed from memory
│ Collection      │
└─────────────────┘
```

#### Flow 4: Automatic Updates on className Changes (MutationObserver)

When you select an element, the DevTools panel automatically watches for className changes and refreshes the panel.

```
┌─────────────────┐
│ DevTools Panel  │ User selects element in Elements panel
└────────┬────────┘
         │ chrome.devtools.panels.elements.onSelectionChanged
         │
         │ chrome.devtools.inspectedWindow.eval(`
         │   // Disconnect old observer (if any)
         │   if (window.__styleMacroObserver) {
         │     window.__styleMacroObserver.disconnect();
         │   }
         │
         │   // Create new MutationObserver on $0
         │   window.__styleMacroObserver = new MutationObserver(() => {
         │     window.postMessage({
         │       action: 'class-changed',
         │       elementId: $0.getAttribute('data-devtools-id')
         │     }, '*');
         │   });
         │
         │   window.__styleMacroObserver.observe($0, {
         │     attributes: true,
         │     attributeFilter: ['class']
         │   });
         │ `)
         ↓
┌─────────────────┐
│ Page DOM        │ MutationObserver active on selected element
└────────┬────────┘
         │
         │ ... User interacts with page, element's className changes ...
         │
         │ MutationObserver detects class attribute change
         │ window.postMessage({ action: 'class-changed', elementId }, '*')
         ↓
┌─────────────────┐
│ Content Script  │ Receives window message, forwards to extension
└────────┬────────┘
         │ chrome.runtime.sendMessage({ action: 'class-changed', elementId })
         ↓
┌─────────────────┐
│ Background      │ Looks up DevTools connection for tabId
└────────┬────────┘
         │ port.postMessage({ action: 'class-changed', elementId })
         ↓
┌─────────────────┐
│ DevTools Panel  │ Verifies elementId matches currently selected element
│                 │ Triggers full panel refresh (re-reads classes, re-queries macros)
└─────────────────┘

When selection changes or panel closes:
  ↓
┌─────────────────┐
│ DevTools Panel  │ Calls disconnectObserver()
└────────┬────────┘
         │ chrome.devtools.inspectedWindow.eval(`
         │   if (window.__styleMacroObserver) {
         │     window.__styleMacroObserver.disconnect();
         │     window.__styleMacroObserver = null;
         │   }
         │ `)
         ↓
┌─────────────────┐
│ Page DOM        │ Old observer disconnected, new observer created for new selection
└─────────────────┘
```

**Key Benefits:**
- Panel automatically refreshes when element classes change (e.g., hover states, conditional styles)
- No manual refresh needed
- Observer is cleaned up properly to prevent memory leaks
- Each element has its own unique tracking ID to prevent cross-contamination

### Key Technical Details

#### Why Background Script is Needed
Chrome extensions prevent direct communication between DevTools and content scripts for security reasons. The background script acts as a trusted intermediary.

#### Static vs Dynamic Macros

The style macro generates different class name patterns based on whether the styles can change at runtime:

**Static Macros** (`-macro-static-{hash}`):
- Used when all style conditions are static (e.g., `style({ color: 'red' })`)
- Macro data is embedded in CSS as `--macro-data: '{...JSON...}'` custom property
- DevTools reads directly from CSS via `getComputedStyle()`

**Dynamic Macros** (`-macro-dynamic-{hash}`):
- Used when style conditions can change (e.g., `style({ color: isActive ? 'red' : 'blue' })`)
- Macro data is sent via `window.postMessage()` whenever conditions change
- Content script stores data and responds to DevTools queries
- Enables real-time updates when props/state change

#### Race Condition Handling (Dynamic Macros Only)
When DevTools queries for dynamic macro data, there's a race condition:
1. Page renders with `-macro-dynamic-{hash}` class name
2. DevTools sees the class and queries for the hash
3. **But**: The page's `window.postMessage` with macro data might not have reached the content script yet

**Solution**: The content script polls `window.__macros[hash]` every 50ms for up to 500ms before giving up. This ensures the data has time to arrive via the async `window.postMessage` flow.

Note: Static macros don't have this issue since the data is synchronously available in CSS.

#### Connection Management
- **DevTools → Background**: Uses persistent `chrome.runtime.connect()` with port-based messaging
- **Content Script → Background**: Uses one-time `chrome.runtime.sendMessage()` calls
- **Background tracks**: Map of `tabId → DevTools port` for routing messages

#### Data Structure
```javascript
// In window.__macros (content script context only)
{
  "zsZ9Dc": {
    loc: "packages/@react-spectrum/s2/src/Button.tsx:67",
    style: {
      "paddingX": "4",
      // ... more CSS properties
    }
  }
}
```

Note: The page context does NOT have access to `window.__macros`. This is stored only in the content script's sandboxed environment for security.

#### Message Types

| Message Type | Direction | Purpose |
|-------------|-----------|---------|
| `update-macros` | Page → Content → Background → DevTools | Notify that a macro was added/updated |
| `query-macros` | DevTools → Background → Content | Request macro data by hash |
| `macro-response` | Content → Background → DevTools | Return requested macro data |
| `get-macro` | Background → Content | Internal forwarding of query-macros |
| `init` | DevTools → Background | Establish connection with tabId |
| `class-changed` | Page → Content → Background → DevTools | Notify that selected element's className changed |

### Debugging

Enable debug logs by uncommenting the `console.log()` lines in each component:
- **DevTools Panel**: `devtool.js` → `debugLog()` function
- **Content Script**: `content-script.js` → `debugLog()` function
- **Background Script**: Already logging to service worker console

View logs in:
- **Page Console**: Content Script and DevTools Panel logs (with `[Content Script]` and `[DevTools]` prefixes)
- **Service Worker Console**: Background Script logs (go to `chrome://extensions` → click "service worker")

