// Template extracted verbatim from upstream Vite's
// code/builders/builder-vite/input/iframe.html (Task 2.2 of the upstream-
// alignment plan). Placeholder strings are filled in below via String.replace.

import { normalizeStories } from "storybook/internal/common";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const TEMPLATE_PATH = fileURLToPath(new URL("./templates/iframe.html", import.meta.url));

export async function generateIframeModern(options) {
  const TEMPLATE = readFileSync(TEMPLATE_PATH, "utf8");
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
    {
      configDir: options.configDir,
      workingDir: process.cwd(),
    }
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
    // OTHER_GLOBALS is a Vite-only injection point used by their externalize
    // plugin to splat extra globals into the inline script. We don't use it;
    // the placeholder must be replaced with a syntactically-valid expression
    // (we use empty string `''`) -- leaving bare `()` would crash the parser.
    .replace(`'[OTHER_GLOBALS HERE]'`, `''`)
    .replace("<!-- [HEAD HTML SNIPPET HERE] -->", headHtmlSnippet || "")
    .replace("<!-- [BODY HTML SNIPPET HERE] -->", bodyHtmlSnippet || "");
}
