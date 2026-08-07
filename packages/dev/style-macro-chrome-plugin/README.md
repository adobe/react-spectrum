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
  - Hosts MutationObserver (created by dev tool panel) that watches selected element for className changes
- **Storage**:
  - Static macros: Data embedded in CSS rules with custom property `--macro-data-{hash}`
  - Dynamic macros: Data stored in global `window.__styleMacroDynamic__` (object with `map` of class name → `{ style, loc }` and an internal interval timer for cleanup)

#### 2. **Content Script** (`content-script.js`)
- **Location**: Isolated sandboxed environment injected into the page
- **Scope**: Acts as a message forwarder between page and extension
- **Responsibility**:
  - Forwards `window.postMessage({ action: 'stylemacro-class-changed' })` from Mutation Observer on page to background script
- **Storage**: None - all macro data is stored in the DOM via CSS custom properties
- **Communication**:
  - Receives:
    - `window.postMessage({ action: 'stylemacro-class-changed', elementId })` from page
  - Sends:
    - `chrome.runtime.sendMessage({ action: 'stylemacro-class-changed', elementId })` to background

#### 3. **Background Script** (`background.js`)
- **Location**: Service worker (isolated context)
- **Responsibility**: Acts as a message broker between DevTools and content scripts
- **State**: Maintains a map of DevTools connections per tab
- **Communication**:
  - Receives:
    - `chrome.runtime.onConnect({ name: 'devtools-page' })` from DevTools
    - `port.onMessage({ type: 'stylemacro-init' })` from DevTools
    - `chrome.runtime.onMessage({ action: 'stylemacro-class-changed', elementId })` from content script
  - Sends:
    - `port.postMessage({ action: 'stylemacro-class-changed', elementId })` to DevTools

#### 4. **DevTools Panel** (`devtool.js`)
- **Location**: DevTools sidebar panel context
- **Responsibility**:
  - Extracts macro class names from selected element:
    - Static macros: `-macro-static-{hash}` → reads `--macro-data-{hash}` custom property via `getComputedStyle()` on the element
    - Dynamic macros: `-macro-dynamic-{hash}` → reads from `window.__styleMacroDynamic__.map["-macro-dynamic-{hash}"]` (plain JSON)
  - Displays style information in sidebar
  - **Automatic Updates**: Sets up a MutationObserver on the selected element to detect className changes and automatically refreshes the panel
- **Storage**: None - all data is read from CSS custom properties on demand
- **Mutation Observer**:
  - Created when an element is selected via `chrome.devtools.panels.elements.onSelectionChanged`
  - Watches the selected element's `class` attribute for changes
  - Disconnects when:
    - A new element is selected
    - The DevTools connection is closed
  - Triggers automatic panel refresh when className changes
- **Communication**:
  - Receives:
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

#### Flow 1b: Dynamic Macro Updates (Page → Global Variable)

Dynamic macros are generated when style macro conditions can change at runtime. Data is written to a global JavaScript variable; a timer on the same object cleans up entries whose class is no longer present in the DOM.

```
┌─────────────────┐
│ Page Context    │
│ (style-macro)   │ Runtime evaluation with dynamic conditions
└────────┬────────┘
         │ 1. Ensure window.__styleMacroDynamic__ exists ({ map: {}, _timer })
         │ 2. Set map["-macro-dynamic-{hash}"] = { style, loc } (plain JSON)
         │ 3. Timer (e.g. every 5 min) removes entries with no matching element in DOM
         ↓
┌─────────────────┐
│ Page (global)    │ window.__styleMacroDynamic__.map["-macro-dynamic-{hash}"] = { style, loc }
└─────────────────┘
```

#### Flow 2: Display Macro Data (Synchronous CSS Lookup)

When the user selects an element or the panel refreshes, DevTools reads macro data as follows.

```
┌─────────────────┐
│ DevTools Panel  │ User selects element with -macro-static-{hash} or -macro-dynamic-{hash} class
└────────┬────────┘
         │ Extract hash from className
         ↓
┌─────────────────┐
│ DevTools Panel  │ Static: getComputedStyle($0).getPropertyValue('--macro-data-{hash}') → JSON.parse
│                 │ Dynamic: window.__styleMacroDynamic__.map["-macro-dynamic-{hash}"] → already { style, loc }
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ DevTools Panel  │ Parses and displays in sidebar
└─────────────────┘
```

**Note**: Static macros are read from CSS custom properties on the inspected element. Dynamic macros are read from the page’s global `window.__styleMacroDynamic__.map` (no CSS involved).

#### Flow 3: Automatic Updates on className Changes (MutationObserver)

When you select an element, the DevTools panel automatically watches for className changes and refreshes the panel.

### Key Technical Details

#### Why Background Script is Needed
Chrome extensions prevent direct communication between DevTools and content scripts for security reasons. The background script acts as a trusted intermediary.

#### Static vs Dynamic Macros

The style macro generates different class name patterns based on whether the styles can change at runtime:

**Static Macros** (`-macro-static-{hash}`):
- Used when all style conditions are static (e.g., `style({ color: 'red' })`)
- Macro data is embedded in CSS rules as a uniquely-named custom property: `--macro-data-{hash}: '{...JSON...}'`
- DevTools reads the specific custom property via `getComputedStyle($0).getPropertyValue('--macro-data-{hash}')`

**Dynamic Macros** (`-macro-dynamic-{hash}`):
- Used when style conditions can change (e.g., `style({color: {default: 'blue', isActive: 'red'}})`)
- Macro data is stored in `window.__styleMacroDynamic__.map["-macro-dynamic-{hash}"]` as plain JSON `{ style, loc }`
- A timer on `window.__styleMacroDynamic__` periodically removes map entries whose class is no longer used in the DOM
- DevTools reads via `window.__styleMacroDynamic__.map["-macro-dynamic-{hash}"]`
- Enables real-time updates when props/state change

#### Connection Management
- **DevTools → Background**: Uses persistent `chrome.runtime.connect()` with port-based messaging
- **Content Script → Background**: Uses one-time `chrome.runtime.sendMessage()` calls
- **Background tracks**: Map of `tabId → DevTools port` for routing messages

#### Data Structure

**Static Macros (in main CSS):**
```css
.-macro-static-zsZ9Dc {
  --macro-data-zsZ9Dc: '{"style":{"paddingX":"4"},"loc":"packages/@react-spectrum/s2/src/Button.tsx:67"}';
}
```

**Dynamic Macros (in page global):**
```javascript
window.__styleMacroDynamic__ = {
  map: {
    "-macro-dynamic-zsZ9Dc": { style: { paddingX: "4" }, loc: "packages/@react-spectrum/s2/src/Button.tsx:67" },
    "-macro-dynamic-abc123": { style: {...}, loc: "..." }
  },
  _timer: 123  // setInterval for cleanup of unused entries
};
```

#### Message Types

| Message Type | Direction | Purpose |
|-------------|-----------|---------|
| `stylemacro-init` | DevTools → Background | Establish connection with tabId |
| `stylemacro-class-changed` | Page → Content → Background → DevTools | Notify that selected element's className changed, triggering panel refresh |

### Debugging

Enable debug logs by uncommenting the `console.log()` lines in each component:
- **DevTools Panel**: `devtool.js` → `debugLog()` function
- **Content Script**: `content-script.js` → `debugLog()` function
- **Background Script**: Already logging to service worker console

View logs in:
- **Page Console**: Content Script and DevTools Panel logs (with `[Content Script]` and `[DevTools]` prefixes)
- **Service Worker Console**: Background Script logs (go to `chrome://extensions` → click "service worker")

