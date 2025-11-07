# Subdomain Dev Server Setup

## Hosts File Configuration

Add these lines to `/etc/hosts`:

```bash
127.0.0.1 react-spectrum-dev.adobe.com
127.0.0.1 react-aria-dev.adobe.com
```

## URL Mappings

- **`react-spectrum-dev.adobe.com:1234/`** → serves content from `/s2/*`
  - Example: `react-spectrum-dev.adobe.com:1234/Accordion.html` → `localhost:1234/s2/Accordion.html`

- **`react-aria-dev.adobe.com:1234/`** → serves content from `/react-aria/*`
  - Example: `react-aria-dev.adobe.com:1234/Autocomplete.html` → `localhost:1234/react-aria/Autocomplete.html`

- **`react-aria-dev.adobe.com:1234/internationalized/*`** → serves content from `/internationalized/*`
  - Example: `react-aria-dev.adobe.com:1234/internationalized/date/index.html` → `localhost:1234/internationalized/date/index.html`
