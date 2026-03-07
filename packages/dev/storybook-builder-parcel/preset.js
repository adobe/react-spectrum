const { Parcel } = require("@parcel/core");
const path = require("path");
const http = require("http");
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

    const proxyOptions = {
      hostname: "127.0.0.1",
      port: 3000,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: "127.0.0.1:3000" },
    };

    const proxyReq = http.request(proxyOptions, (proxyRes) => {
      // Parcel dev server responds with main HTML page if the file doesn't exist...
      if (
        proxyRes.statusCode === 404 ||
        (proxyRes.headers["content-type"]?.startsWith("text/html") &&
          !req.url.startsWith("/iframe.html"))
      ) {
        proxyRes.resume();
        return next();
      }

      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.setTimeout(10000, () => {
      proxyReq.destroy(new Error("Proxy request timed out after 10 seconds"));
      if (!res.headersSent) {
        res.writeHead(504).end("Proxy Timeout");
      }
    });
    
    proxyReq.on("error", (err) => {
      if (err.code === "ECONNREFUSED") return next();
      if (!res.headersSent) res.writeHead(502).end(); 
    });

    req.on("close", () => {
      proxyReq.destroy();
    });

    if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
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
          host: "127.0.0.1",
        }
      : null,
    hmrOptions: isDev
      ? {
          port: 3001,
          host: "127.0.0.1",
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
