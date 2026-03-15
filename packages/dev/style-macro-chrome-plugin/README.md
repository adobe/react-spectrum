# style-macro-chrome-plugin

This is a chrome plugin to assist in debugging the styles applied by the React Spectrum Style Macro.

## Expected Usage

Until the plugin is published to the Chrome web extension store, the easiest thing to do is to build using the command
```
yarn workspace style-macro-chrome-plugin build
```

This will create a dist directory in the directory `packages/dev/style-macro-chrome-plugin`, you should copy this directory to somewhere permanent on your machine.

Next, open Chrome and go to [chrome://extensions/](chrome://extensions/).

Load an unpacked extension, it's a button in the top left, and navigate to the dist directory.

The extension is now registered in Chrome and you can go to storybook or docs, wherever you are working.

Inspect an element on the page to open dev tools and go to the Style Macro panel.

## Local development

From the root of our monopackage, run

```
yarn
yarn workspace style-macro-chrome-plugin start
// or build to avoid refresh bugs in HMR
yarn workspace style-macro-chrome-plugin build
```

This will create a dist directory in the directory `packages/dev/style-macro-chrome-plugin` which will update anytime the code changes and results in a rebuild.

Now follow the instructions in the above section starting from "Next, open chrome".

## Troubleshooting

If the panel isn't updating with styles, try closing the dev tools and reopening it.

If the extension doesn't appear to have the latest code, try closing the dev tools and reopening it. You may also want to go to the extensions page and either "refresh" or remove and re-add the extension.

If every tab you have open (or many of them) reload when you make local changes to the extension, then go into the extension settings and limit it to `localhost` or something appropriate.

## ToDos

- [ ] Would be pretty cool if we could match a style condition to trigger it, like hover
- [ ] Our own UI ??
- [ ] Filtering
- [ ] Resolve css variables inline
- [ ] Link to file on the side instead of grouping by filename?
- [ ] Add classname that is applying style?

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
  - For static macros: Embeds data in CSS custom property `--macro-data-{hash}` (unique per macro)
  - For dynamic macros: Sends `window.postMessage({ action: 'stylemacro-update-macros', hash, loc, style })` to content script
  - For className changes: Sends `window.postMessage({ action: 'stylemacro-class-changed', elementId })` to content script

#### 2. **Content Script** (`content-script.js`)
- **Location**: Isolated sandboxed environment injected into the page
- **Scope**: Acts as a message forwarder between page and extension
- **Responsibility**:
  - Listens for `window.postMessage({ action: 'stylemacro-update-macros' })` from the page and forwards to background script
  - Forwards `window.postMessage({ action: 'stylemacro-class-changed' })` from page to background script
- **Storage**: None - all macro data is stored in DevTools
- **Communication**:
  - Receives:
    - `window.postMessage({ action: 'stylemacro-update-macros', hash, loc, style })` from page
    - `window.postMessage({ action: 'stylemacro-class-changed', elementId })` from page
  - Sends:
    - `chrome.runtime.sendMessage({ action: 'stylemacro-update-macros', hash, loc, style })` to background
    - `chrome.runtime.sendMessage({ action: 'stylemacro-class-changed', elementId })` to background

#### 3. **Background Script** (`background.js`)
- **Location**: Service worker (isolated context)
- **Responsibility**: Acts as a message broker between DevTools and content scripts
- **State**: Maintains a map of DevTools connections per tab
- **Communication**:
  - Receives:
    - `chrome.runtime.onConnect({ name: 'devtools-page' })` from DevTools
    - `port.onMessage({ type: 'stylemacro-init' })` from DevTools
    - `chrome.runtime.onMessage({ action: 'stylemacro-update-macros', hash, loc, style })` from content script
    - `chrome.runtime.onMessage({ action: 'stylemacro-class-changed', elementId })` from content script
  - Sends:
    - `port.postMessage({ action: 'stylemacro-update-macros', hash, loc, style })` to DevTools
    - `port.postMessage({ action: 'stylemacro-class-changed', elementId })` to DevTools

#### 4. **DevTools Panel** (`devtool.js`)
- **Location**: DevTools sidebar panel context
- **Responsibility**:
  - Stores all dynamic macro data in a local Map: `macroData[hash] = { loc, style }`
  - Extracts macro class names from selected element:
    - Static macros: `-macro-static-{hash}` → reads `--macro-data-{hash}` custom property via `getComputedStyle()`
    - Dynamic macros: `-macro-dynamic-{hash}` → looks up data from local storage
  - Displays style information in sidebar
  - **Automatic Updates**: Sets up a MutationObserver on the selected element to detect className changes and automatically refreshes the panel
  - **Cleanup**: Every 5 minutes, checks the DOM for each stored hash and removes data for macros that no longer exist
- **Storage**: `Map<hash, {loc: string, style: object}>` - stores all dynamic macro data
- **Mutation Observer**:
  - Created when an element is selected via `chrome.devtools.panels.elements.onSelectionChanged`
  - Watches the selected element's `class` attribute for changes
  - Disconnects when:
    - A new element is selected
    - The DevTools connection is closed
  - Triggers automatic panel refresh when className changes
- **Communication**:
  - Receives:
    - `port.onMessage({ action: 'stylemacro-update-macros', hash, loc, style })` from background (stores data and refreshes)
    - `port.onMessage({ action: 'stylemacro-class-changed', elementId })` from background (triggers refresh)
  - Sends:
    - `chrome.runtime.connect({ name: 'devtools-page' })` to establish connection
    - `port.postMessage({ type: 'stylemacro-init', tabId })` to background

### Message Flow Diagrams

#### Flow 1a: Static Macro Lookup (DevTools reads CSS)

Static macros are generated when style macro conditions don't change at runtime. The macro data is embedded directly into the CSS as a uniquely-named custom property.

```
┌─────────────────┐
│ DevTools Panel  │ User selects element with -macro-static-{hash} class
└────────┬────────┘
         │ Extract hash from className
         │ Read --macro-data-{hash} via getComputedStyle($0)
         ↓
┌─────────────────┐
│ Page DOM/CSS    │ Returns custom property value for specific hash
└────────┬────────┘
         │ getPropertyValue('--macro-data-{hash}')
         │ { loc: "...", style: {...} }
         ↓
┌─────────────────┐
│ DevTools Panel  │ Parses and displays in sidebar
└─────────────────┘
```

**Key Design**: Each static macro has its own uniquely-named custom property (`--macro-data-{hash}`), which avoids CSS cascade issues when reading multiple macro data from the same element.

#### Flow 1b: Dynamic Macro Updates (Page → DevTools)

Dynamic macros are generated when style macro conditions can change at runtime. Updates are sent via message passing and stored directly in DevTools.

```
┌─────────────────┐
│ Page Context    │
│ (style-macro)   │
└────────┬────────┘
         │ window.postMessage({ action: 'stylemacro-update-macros', hash, loc, style })
         ↓
┌─────────────────┐
│ Content Script  │ Forwards message (no storage)
└────────┬────────┘
         │ chrome.runtime.sendMessage({ action: 'stylemacro-update-macros', hash, loc, style })
         ↓
┌─────────────────┐
│ Background      │ Looks up DevTools connection for tabId
└────────┬────────┘
         │ port.postMessage({ action: 'stylemacro-update-macros', hash, loc, style })
         ↓
┌─────────────────┐
│ DevTools Panel  │ Stores in macroData Map and triggers sidebar refresh
└─────────────────┘
```

#### Flow 2: Display Macro Data (Synchronous Lookup)

When the user selects an element or the panel refreshes, DevTools looks up macro data synchronously from its local storage.

```
┌─────────────────┐
│ DevTools Panel  │ User selects element with -macro-dynamic-{hash} class
└────────┬────────┘
         │ Extract hash from className
         ↓
┌─────────────────┐
│ DevTools Panel  │ Look up macroData.get(hash)
│ Local Storage   │ Returns { loc, style } if available
└────────┬────────┘
         │ { loc: "...", style: {...} } or null
         ↓
┌─────────────────┐
│ DevTools Panel  │ Display in sidebar (or show nothing if null)
└─────────────────┘
```

**Note**: If macro data hasn't been received yet for a hash, it will appear empty until the next `stylemacro-update-macros` message arrives and triggers a refresh.

#### Flow 3: Macro Data Cleanup (Automated)

Every 5 minutes, DevTools checks if stored macro hashes are still in use on the page and removes stale data.

```
┌─────────────────┐
│ DevTools Panel  │ Every 5 minutes
└────────┬────────┘
         │ For each hash in macroData Map:
         │   chrome.devtools.inspectedWindow.eval(
         │     `!!document.querySelector('.-macro-dynamic-${hash}')`
         │   )
         ↓
┌─────────────────┐
│ Page DOM        │ Checks if elements with macro classes exist
└────────┬────────┘
         │ Returns true/false for each hash
         ↓
┌─────────────────┐
│ DevTools Panel  │ Removes stale entries from macroData Map
│                 │ macroData.delete(hash) for non-existent elements
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
         │       action: 'stylemacro-class-changed',
         │       elementId: $0.__devtoolsId
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
         │ window.postMessage({ action: 'stylemacro-class-changed', elementId }, '*')
         ↓
┌─────────────────┐
│ Content Script  │ Receives window message, forwards to extension
└────────┬────────┘
         │ chrome.runtime.sendMessage({ action: 'stylemacro-class-changed', elementId })
         ↓
┌─────────────────┐
│ Background      │ Looks up DevTools connection for tabId
└────────┬────────┘
         │ port.postMessage({ action: 'stylemacro-class-changed', elementId })
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
- Macro data is embedded in CSS as a uniquely-named custom property: `--macro-data-{hash}: '{...JSON...}'`
- DevTools reads the specific custom property via `getComputedStyle($0).getPropertyValue('--macro-data-{hash}')`
- Unique naming avoids CSS cascade issues when multiple macros are applied to the same element

**Dynamic Macros** (`-macro-dynamic-{hash}`):
- Used when style conditions can change (e.g., `style({color: {default: 'blue', isActive: 'red'}})`)
- Macro data is sent via `window.postMessage({ action: 'stylemacro-update-macros', ... })` whenever conditions change
- Content script forwards data to DevTools, which stores it in a local Map
- Enables real-time updates when props/state change

#### Data Storage
- **Static Macros**: Data embedded in CSS as uniquely-named custom properties `--macro-data-{hash}`, read via `getComputedStyle($0).getPropertyValue('--macro-data-{hash}')`
  - Each macro has its own custom property name to prevent cascade conflicts
  - Example: `.-macro-static-abc123 { --macro-data-abc123: '{"style": {...}, "loc": "..."}'; }`
- **Dynamic Macros**: Data stored in DevTools panel's `macroData` Map
- **No Content Script Storage**: Content script only forwards messages, doesn't store macro data
- **Lifetime**: Macro data persists in DevTools for the duration of the DevTools session
- **Cleanup**: Stale macro data (for elements no longer in DOM) is removed every 5 minutes

#### Connection Management
- **DevTools → Background**: Uses persistent `chrome.runtime.connect()` with port-based messaging
- **Content Script → Background**: Uses one-time `chrome.runtime.sendMessage()` calls
- **Background tracks**: Map of `tabId → DevTools port` for routing messages

#### Data Structure

**Static Macros (in CSS):**
```css
.-macro-static-zsZ9Dc {
  --macro-data-zsZ9Dc: '{"style":{"paddingX":"4"},"loc":"packages/@react-spectrum/s2/src/Button.tsx:67"}';
}
```

**Dynamic Macros (in DevTools panel's macroData Map):**
```javascript
Map {
  "zsZ9Dc" => {
    loc: "packages/@react-spectrum/s2/src/Button.tsx:67",
    style: {
      "paddingX": "4",
      // ... more CSS properties
    }
  }
}
```

**Note**:
- Static macro data is stored in CSS with uniquely-named custom properties
- Dynamic macro data is stored directly in the DevTools panel context
- The content script acts purely as a message forwarder and doesn't store any data

#### Message Types

| Message Type | Direction | Purpose |
|-------------|-----------|---------|
| `stylemacro-update-macros` | Page → Content → Background → DevTools | Send macro data (hash, loc, style) to be stored in DevTools |
| `stylemacro-init` | DevTools → Background | Establish connection with tabId |
| `stylemacro-class-changed` | Page → Content → Background → DevTools | Notify that selected element's className changed |

### Debugging

Enable debug logs by uncommenting the `console.log()` lines in each component:
- **DevTools Panel**: `devtool.js` → `debugLog()` function
- **Content Script**: `content-script.js` → `debugLog()` function
- **Background Script**: Already logging to service worker console

View logs in:
- **Page Console**: Content Script and DevTools Panel logs (with `[Content Script]` and `[DevTools]` prefixes)
- **Service Worker Console**: Background Script logs (go to `chrome://extensions` → click "service worker")

