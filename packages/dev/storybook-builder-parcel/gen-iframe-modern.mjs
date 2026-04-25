import { normalizeStories } from "storybook/internal/common";

const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title><!-- [TITLE HERE] --></title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script>
      window.CONFIG_TYPE = '[CONFIG_TYPE HERE]';
      window.LOGLEVEL = '[LOGLEVEL HERE]';
      window.FRAMEWORK_OPTIONS = '[FRAMEWORK_OPTIONS HERE]';
      window.CHANNEL_OPTIONS = '[CHANNEL_OPTIONS HERE]';
      window.FEATURES = '[FEATURES HERE]';
      window.STORIES = '[STORIES HERE]';
      window.DOCS_OPTIONS = '[DOCS_OPTIONS HERE]';
      window.TAGS_OPTIONS = '[TAGS_OPTIONS HERE]';
      window.SERVER_CHANNEL_URL = '[SERVER_CHANNEL_URL HERE]';

      ('[OTHER_GLOBALS HERE]');

      // We do this so that "module && module.hot" etc. in Storybook source code
      // doesn't fail (it will simply be disabled)
      window.module = undefined;
      window.global = window;
    </script>
    <!-- [HEAD HTML SNIPPET HERE] -->
  </head>
  <body>
    <!-- [BODY HTML SNIPPET HERE] -->
    <div id="storybook-root"></div>
    <div id="storybook-docs"></div>
    <script type="module" src="preview-main.js"></script>
  </body>
</html>
`;

export async function generateIframeModern(options) {
  const { configType, features, presets, serverChannelUrl, title } = options;
  const frameworkOptions = await presets.apply("frameworkOptions");
  const headHtmlSnippet = await presets.apply("previewHead");
  const bodyHtmlSnippet = await presets.apply("previewBody");
  const logLevel = await presets.apply("logLevel", undefined);
  const docsOptions = await presets.apply("docs");
  const tagsOptions = await presets.apply("tags", {});

  const coreOptions = await presets.apply("core");
  const stories = normalizeStories(
    await options.presets.apply("stories", [], options),
    { configDir: options.configDir, workingDir: process.cwd() }
  ).map((specifier) => ({
    ...specifier,
    importPathMatcher: specifier.importPathMatcher.source,
  }));

  return TEMPLATE
    .replace("<!-- [TITLE HERE] -->", title || "Storybook")
    .replace("[CONFIG_TYPE HERE]", configType || "")
    .replace("[LOGLEVEL HERE]", logLevel || "")
    .replace(`'[FRAMEWORK_OPTIONS HERE]'`, JSON.stringify(frameworkOptions))
    .replace(
      `'[CHANNEL_OPTIONS HERE]'`,
      JSON.stringify(coreOptions?.channelOptions ?? {})
    )
    .replace(`'[FEATURES HERE]'`, JSON.stringify(features || {}))
    .replace(`'[STORIES HERE]'`, JSON.stringify(stories || {}))
    .replace(`'[DOCS_OPTIONS HERE]'`, JSON.stringify(docsOptions || {}))
    .replace(`'[TAGS_OPTIONS HERE]'`, JSON.stringify(tagsOptions || {}))
    .replace(`'[SERVER_CHANNEL_URL HERE]'`, JSON.stringify(serverChannelUrl))
    .replace(`'[OTHER_GLOBALS HERE]'`, `''`)
    .replace("<!-- [HEAD HTML SNIPPET HERE] -->", headHtmlSnippet || "")
    .replace("<!-- [BODY HTML SNIPPET HERE] -->", bodyHtmlSnippet || "");
}
