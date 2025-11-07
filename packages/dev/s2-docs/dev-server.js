#!/usr/bin/env node

/**
 * Custom dev server wrapper for Parcel that adds subdomain routing middleware.
 *
 * This starts Parcel on port 8080, then creates a proxy on port 1234 that:
 * - Routes react-spectrum-dev.adobe.com to /s2/*
 * - Routes react-aria-dev.adobe.com to /react-aria/*
 * - Handles cross-subdomain redirects
 */

const express = require('express');
const {createProxyMiddleware} = require('http-proxy-middleware');
const {spawn} = require('child_process');

const PARCEL_PORT = 8080;
const PROXY_PORT = 1234;

// Start Parcel on a different port
console.log('🚀 Starting Parcel dev server...');
const parcelProcess = spawn('npx', [
  'parcel',
  '--config',
  '.parcelrc-s2-docs',
  '--port',
  PARCEL_PORT.toString()
], {
  env: {...process.env, DOCS_ENV: 'dev'},
  stdio: 'inherit',
  shell: true
});

parcelProcess.on('error', (err) => {
  console.error('Failed to start Parcel:', err);
  process.exit(1);
});

parcelProcess.on('exit', (code) => {
  console.log(`Parcel exited with code ${code}`);
  process.exit(code);
});

// Give Parcel a moment to start, then create the proxy
setTimeout(() => {
  const app = express();

  // Middleware for subdomain routing and cross-domain redirects
  app.use((req, res, next) => {
    const host = req.headers.host;
    const originalUrl = req.url;

    // Check if this is a static asset (has file extension like .css, .js, .map, .png, etc.)
    // Static assets should not be path-rewritten
    // Note: .rsc and .html files ARE rewritten (they're page content, not static assets)
    const isStaticAsset = /\.(css|js|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico)(\?.*)?$/.test(originalUrl);

    // Check if we're on react-spectrum subdomain
    if (host && host.startsWith('react-spectrum-dev.adobe.com')) {
      // If accessing /react-aria/ path on spectrum subdomain, redirect to aria subdomain
      if (originalUrl.startsWith('/react-aria/')) {
        const newPath = originalUrl.replace('/react-aria/', '/');
        console.log(`[Proxy] Redirecting from spectrum to aria: ${originalUrl} -> ${newPath}`);
        return res.redirect(301, `http://react-aria-dev.adobe.com:${PROXY_PORT}${newPath}`);
      }
      // If NOT already starting with /s2/ and NOT a static asset, add it
      if (!originalUrl.startsWith('/s2/') && !isStaticAsset) {
        console.log(`[Proxy] Rewriting spectrum path: ${originalUrl} -> /s2${originalUrl}`);
        req.url = '/s2' + originalUrl;
      }
    }
    // Check if we're on react-aria subdomain
    else if (host && host.startsWith('react-aria-dev.adobe.com')) {
      // If accessing /s2/ path on aria subdomain, redirect to spectrum subdomain
      if (originalUrl.startsWith('/s2/')) {
        const newPath = originalUrl.replace('/s2/', '/');
        console.log(`[Proxy] Redirecting from aria to spectrum: ${originalUrl} -> ${newPath}`);
        return res.redirect(301, `http://react-spectrum-dev.adobe.com:${PROXY_PORT}${newPath}`);
      }
      // If path starts with /internationalized/, keep it as-is (no rewrite)
      if (originalUrl.startsWith('/internationalized/')) {
        console.log(`[Proxy] Keeping internationalized path: ${originalUrl}`);
        // Don't modify req.url, just pass through
      }
      // If NOT already starting with /react-aria/ and NOT a static asset and NOT internationalized, add it
      else if (!originalUrl.startsWith('/react-aria/') && !isStaticAsset) {
        console.log(`[Proxy] Rewriting aria path: ${originalUrl} -> /react-aria${originalUrl}`);
        req.url = '/react-aria' + originalUrl;
      }
    }

    next();
  });

  // Proxy all requests to Parcel
  app.use(createProxyMiddleware({
    target: `http://localhost:${PARCEL_PORT}`,
    ws: true,
    changeOrigin: false,
    onProxyReq: (proxyReq, req) => {
      // Use the rewritten URL
      proxyReq.path = req.url;
    }
  }));

  app.listen(PROXY_PORT, () => {
    console.log(`\n✨ Proxy server running on port ${PROXY_PORT}`);
    console.log('\n🌐 Access your docs at:');
    console.log(`   - http://localhost:${PROXY_PORT}`);
    console.log(`   - http://react-spectrum-dev.adobe.com:${PROXY_PORT}`);
    console.log(`   - http://react-aria-dev.adobe.com:${PROXY_PORT}\n`);
  });
}, 2000);

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  parcelProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  parcelProcess.kill();
  process.exit(0);
});

