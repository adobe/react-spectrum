import { Parcel } from "@parcel/core";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProxyMiddleware } from "http-proxy-middleware";
import fs from "node:fs";

import { generateIframeModern } from "./gen-iframe-modern.mjs";
import {
  generatePreviewModern,
  generateSetupAddons,
} from "./gen-preview-modern.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const generatedEntries = path.join(__dirname, "generated-entries");

let watcherSubscription;

export async function start({ options, router }) {
  const parcel = await createParcel(options, true);

  router.use(async (req, res, next) => {
    if (req.url === "/" || req.url === "/index.html") return next();

    const proxy = createProxyMiddleware({
      target: "http://localhost:3000/",
      selfHandleResponse: true,
      logLevel: "warn",
      onProxyRes(proxyRes, req, res) {
        if (
          proxyRes.statusCode === 404 ||
          (proxyRes.headers["content-type"]?.startsWith("text/html") &&
            !req.url.startsWith("/iframe.html"))
        ) {
          return next();
        }
        res.statusCode = proxyRes.statusCode;
        for (const header in proxyRes.headers) {
          res.setHeader(header, proxyRes.headers[header]);
        }
        proxyRes.pipe(res);
      },
    });

    const { socket, connection } = req;
    req.socket = null;
    req.connection = null;
    await proxy(req, res, next);
    req.socket = socket;
    req.connection = connection;
  });

  watcherSubscription = await parcel.watch();
  process.on("SIGINT", async () => {
    await watcherSubscription?.unsubscribe();
    process.exit();
  });

  return {
    async bail() { await watcherSubscription?.unsubscribe(); },
    stats: {},
    totalTime: 0,
  };
}

export async function build({ options }) {
  const parcel = await createParcel(options);
  await parcel.run();
}

export const corePresets = [];

export async function bail() {
  await watcherSubscription?.unsubscribe();
}

async function createParcel(options, isDev = false) {
  fs.mkdirSync(generatedEntries, { recursive: true });
  fs.writeFileSync(
    path.join(generatedEntries, "iframe.html"),
    await generateIframeModern(options, generatedEntries)
  );
  fs.writeFileSync(
    path.join(generatedEntries, "setup-addons.js"),
    generateSetupAddons()
  );
  fs.writeFileSync(
    path.join(generatedEntries, "preview-main.js"),
    await generatePreviewModern(options, generatedEntries)
  );

  return new Parcel({
    entries: path.join(generatedEntries, "iframe.html"),
    config: path.resolve(options.configDir, ".parcelrc"),
    mode: isDev ? "development" : "production",
    serveOptions: isDev ? { port: 3000 } : null,
    hmrOptions: isDev ? { port: 3001 } : null,
    additionalReporters: [
      { packageName: "@parcel/reporter-cli", resolveFrom: __filename },
    ],
    targets: {
      storybook: {
        distDir: options.outputDir,
        publicUrl: "./",
        engines: {
          browsers: [
            "last 2 Chrome version",
            "last 2 Safari versions",
            "last 2 Edge version",
            "last 2 Firefox versions",
          ],
        },
      },
    },
  });
}
