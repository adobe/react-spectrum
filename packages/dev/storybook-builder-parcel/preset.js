const { Parcel } = require("@parcel/core");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");
const fs = require("fs");

const { generateIframeModern } = require("./gen-iframe-modern.js");
const { generatePreviewModern } = require("./gen-preview-modern.js");

const generatedEntries = path.join(__dirname, "generated-entries");

exports.start = async function ({ options, router }) {
  let parcel = await createParcel(options, true);

  router.use(async (req, res, next) => {
    if (req.url === "/" || req.url === "/index.html") {
      return next();
    }

    let proxy = createProxyMiddleware({
      target: "http://localhost:3000/",
      selfHandleResponse: true,
      logLevel: "warn",
      onProxyRes(proxyRes, req, res) {
        // Parcel dev server responds with main HTML page if the file doesn't exist...
        if (
          proxyRes.statusCode === 404 ||
          (proxyRes.headers["content-type"]?.startsWith("text/html") &&
            !req.url.startsWith("/iframe.html"))
        ) {
          return next();
        } else {
          res.statusCode = proxyRes.statusCode;
          for (let header in proxyRes.headers) {
            res.setHeader(header, proxyRes.headers[header]);
          }
          proxyRes.pipe(res);
        }
      },
    });

    // Remove socket/connection temporarily to prevent proxy from subscribing to `close` event and triggering warning.
    let { socket, connection } = req;
    req.socket = null;
    req.connection = null;
    await proxy(req, res, next);
    req.socket = socket;
    req.connection = connection;
  });

  let subscription = await parcel.watch();
  process.on("SIGINT", async () => {
    await subscription.unsubscribe();
    process.exit();
  });

  return {
    async bail(e) {
      await subscription.unsubscribe();
    },
    stats: {},
    totalTime: 0,
  };
};

exports.build = async function ({ options }) {
  let parcel = await createParcel(options);
  await parcel.run();
};

exports.corePresets = [];
exports.previewPresets = [];
exports.bail = async () => {};

async function createParcel(options, isDev = false) {
  fs.mkdirSync(generatedEntries, { recursive: true });
  fs.writeFileSync(
    path.join(generatedEntries, "iframe.html"),
    await generateIframeModern(options, generatedEntries)
  );
  fs.writeFileSync(
    path.join(generatedEntries, "preview.js"),
    await generatePreviewModern(options, generatedEntries)
  );

  return new Parcel({
    entries: path.join(generatedEntries, "iframe.html"),
    config: path.resolve(options.configDir, ".parcelrc"),
    mode: isDev ? "development" : "production",
    serveOptions: isDev
      ? {
          port: 3000,
        }
      : null,
    hmrOptions: isDev
      ? {
          port: 3001,
        }
      : null,
    additionalReporters: [
      {
        packageName: "@parcel/reporter-cli",
        resolveFrom: __filename,
      },
    ],
    targets: {
      storybook: {
        distDir: options.outputDir,
        publicUrl: "./",
        engines: {
          browsers: ['last 2 Chrome version', 'last 2 Safari versions', 'last 2 Edge version', 'last 2 Firefox versions']
        }
      }
    }
  });
}
