# style-macro-chrome-plugin

This is a chrome plugin to assist in debugging the styles applied by our Style Macro.

## Local development

From the root of our monopackage, run

```
yarn
yarn workspace style-macro-chrome-plugin start
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

#### 1. **Page Context** (style-macro runtime)
- **Location**: Runs in the actual page's JavaScript context
- **Responsibility**: Generates macro metadata (hash, location, styles) when style macro is evaluated
- **Storage**: None - only sends messages
- **Communication**:
  - Sends: `window.postMessage({ action: 'update-macros', hash, loc, style })` to content script

#### 2. **Content Script** (`content-script.js`)
- **Location**: Isolated sandboxed environment injected into the page
- **Responsibility**:
  - Listens for `window.postMessage({ action: 'update-macros' })` from the page and stores macro data in its own `window.__macros`
  - Responds to queries from DevTools (via background script)
  - Cleans up stale macros every 5 minutes
- **Storage**: `window.__macros[hash] = { loc: string, style: object }` (in content script context, not page context)
- **Communication**:
  - Receives:
    - `window.postMessage({ action: 'update-macros' })` from page
    - `chrome.runtime.onMessage({ action: 'get-macro' })` from background
  - Sends:
    - `chrome.runtime.sendMessage({ action: 'update-macros' })` to background
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
  - Sends:
    - `chrome.tabs.sendMessage({ action: 'get-macro' })` to content script
    - `port.postMessage({ action: 'update-macros' })` to DevTools
    - `port.postMessage({ action: 'macro-response' })` to DevTools

#### 4. **DevTools Panel** (`devtool.js`)
- **Location**: DevTools sidebar panel context
- **Responsibility**:
  - Extracts macro class names from selected element (`-macro$hash`)
  - Queries for macro data from content script
  - Displays style information in sidebar
- **Communication**:
  - Receives:
    - `port.onMessage({ action: 'macro-response' })` from background
    - `port.onMessage({ action: 'update-macros' })` from background
  - Sends:
    - `chrome.runtime.connect({ name: 'devtools-page' })` to establish connection
    - `port.postMessage({ type: 'init' })` to background
    - `port.postMessage({ type: 'query-macros' })` to background

### Message Flow Diagrams

#### Flow 1: Style Macro Updates (Page → DevTools)

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
│ DevTools Panel  │ User selects element with -macro$hash class
└────────┬────────┘
         │ port.postMessage({ type: 'query-macros', hash })
         ↓
┌─────────────────┐
│ Background      │ Forwards to content script in specified tab
└────────┬────────┘
         │ chrome.tabs.sendMessage(tabId, { action: 'get-macro', hash })
         ↓
┌─────────────────┐
│ Content Script  │ Reads from window.__macros[hash]
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
         │   Check if document.querySelector(`.-macro\$${hash}`) exists
         │   If not found, delete window.__macros[hash]
         ↓
┌─────────────────┐
│ Garbage         │ Stale macros removed from memory
│ Collection      │
└─────────────────┘
```

### Key Technical Details

#### Why Background Script is Needed
Chrome extensions prevent direct communication between DevTools and content scripts for security reasons. The background script acts as a trusted intermediary.

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

### Debugging

Enable debug logs by uncommenting the `console.log()` lines in each component:
- **DevTools Panel**: `devtool.js` → `debugLog()` function
- **Content Script**: `content-script.js` → `debugLog()` function
- **Background Script**: Already logging to service worker console

View logs in:
- **Page Console**: Content Script and DevTools Panel logs (with `[Content Script]` and `[DevTools]` prefixes)
- **Service Worker Console**: Background Script logs (go to `chrome://extensions` → click "service worker")

