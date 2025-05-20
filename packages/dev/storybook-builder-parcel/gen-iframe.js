const { normalizeStories } = require("@storybook/core-common");

module.exports.generateIframe = async function generateIframe(options) {
  const { configType, features, framework, presets, serverChannelUrl, title } =
    options;
  const headHtmlSnippet = await presets.apply("previewHead");
  const bodyHtmlSnippet = await presets.apply("previewBody");
  const logLevel = await presets.apply("logLevel", undefined);
  const frameworkOptions = await presets.apply(`${framework}Options`, {});
  const coreOptions = await presets.apply("core");
  const stories = normalizeStories(
    await options.presets.apply("stories", [], options),
    {
      configDir: options.configDir,
      workingDir: process.cwd(),
    }
  ).map((specifier) => ({
    ...specifier,
    importPathMatcher: specifier.importPathMatcher.source,
  }));

  let code = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${title || "Storybook"}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script>
        window.CONFIG_TYPE = '${configType || ""}';
        window.LOGLEVEL = '${logLevel || ""}';
        window.FRAMEWORK_OPTIONS = ${JSON.stringify(frameworkOptions || {})};
        window.CHANNEL_OPTIONS = ${JSON.stringify(
          coreOptions && coreOptions.channelOptions
            ? coreOptions.channelOptions
            : {}
        )};
        window.FEATURES = ${JSON.stringify(features || {})};
        window.STORIES = ${JSON.stringify(stories || {})};
        window.SERVER_CHANNEL_URL = '${serverChannelUrl || ""}';
      </script>
      ${headHtmlSnippet || ""}
      <style>
        #root[hidden],
        #docs-root[hidden] {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${bodyHtmlSnippet || ""}
      <div id="storybook-root"></div>
      <div id="storybook-docs"></div>
      <script src="preview.js" type="module"></script>
    </body>
  </html>
  `;

  return code;
};
