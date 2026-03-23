# App setup and style macro

## Full-page apps

- Import `@react-spectrum/s2/page.css` in the app entrypoint so the page background and color scheme are applied before JavaScript runs.
- Do not carry over a v3 root `Provider theme={defaultTheme}` wrapper just to make the app render. S2 does not require that pattern.
- Do not assume there is only one app root. Standalone pages, alternate entrypoints, utility apps, embedded sub-apps, and test-only render targets may each need their own `page.css` or Provider cleanup.

## Embedded sections

- If S2 renders as part of a larger page instead of owning the whole document, keep the S2 subtree inside `<Provider background="...">` rather than importing `page.css` globally.

## Provider decisions

- Use S2 `Provider` when you need locale overrides, router integration, explicit color-scheme/background control, or SSR with `elementType="html"`.
- Remove `theme={defaultTheme}` and other v3 theme props. They do not carry forward to S2.
- Preserve surrounding app-shell providers such as routing, Redux/store, analytics, i18n/intl, and product-framework host providers. Replace only the React Spectrum-specific wrapper instead of flattening the whole provider stack.
- For tests, wrap only the cases that actually need S2 context such as locale or background. Do not recreate a full v3 theme wrapper by default.

## Bundlers

- Detect the bundler at the migration target level, especially in monorepos. The workspace root may include Storybook, Vite, or other tooling that does not represent the runtime bundler for the package being migrated.
- Parcel v2.12.0+ already supports S2 macros. Most Parcel repos only need the package install and the right entrypoint CSS import.
- Non-Parcel bundlers need `unplugin-parcel-macros` and the appropriate framework setup. Keep plugin ordering correct so macros run before the rest of the toolchain.
- If the repo already has a framework-specific S2 setup, preserve it instead of layering a second macro configuration on top.
