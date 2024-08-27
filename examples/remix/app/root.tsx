import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useHref
} from '@remix-run/react';
import type {NavigateOptions} from 'react-router-dom';
import {Provider, defaultTheme} from '@adobe/react-spectrum';

declare module '@adobe/react-spectrum' {
  interface RouterConfig {
    routerOptions: NavigateOptions
  }
}

export default function App() {
  let navigate = useNavigate();
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Provider 
          theme={defaultTheme}
          locale="en"
          router={{
            navigate,
            useHref
          }}>
          <Outlet />
        </Provider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
