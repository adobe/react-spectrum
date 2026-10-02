import {normalizeStories} from 'storybook/internal/common';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const TEMPLATE_PATH = fileURLToPath(new URL('./templates/iframe.html', import.meta.url));

export async function generateIframeModern(options) {
  const TEMPLATE = readFileSync(TEMPLATE_PATH, 'utf8');
  const {configType, features, presets, serverChannelUrl, title} = options;
  const frameworkOptions = await presets.apply('frameworkOptions');
  const headHtmlSnippet = await presets.apply('previewHead');
  const bodyHtmlSnippet = await presets.apply('previewBody');
  const logLevel = await presets.apply('logLevel', undefined);
  const docsOptions = await presets.apply('docs');
  const tagsOptions = await presets.apply('tags', {});

  const coreOptions = await presets.apply('core');
  const stories = normalizeStories(await options.presets.apply('stories', [], options), {
    configDir: options.configDir,
    workingDir: process.cwd()
  }).map(specifier => ({
    ...specifier,
    importPathMatcher: specifier.importPathMatcher.source
  }));

  return TEMPLATE.replace('<!-- [TITLE HERE] -->', title || 'Storybook')
    .replace('[CONFIG_TYPE HERE]', configType || '')
    .replace('[LOGLEVEL HERE]', logLevel || '')
    .replace(`'[FRAMEWORK_OPTIONS HERE]'`, JSON.stringify(frameworkOptions))
    .replace(
      `'[CHANNEL_OPTIONS HERE]'`,
      JSON.stringify(coreOptions && coreOptions.channelOptions ? coreOptions.channelOptions : {})
    )
    .replace(`'[FEATURES HERE]'`, JSON.stringify(features || {}))
    .replace(`'[STORIES HERE]'`, JSON.stringify(stories || {}))
    .replace(`'[DOCS_OPTIONS HERE]'`, JSON.stringify(docsOptions || {}))
    .replace(`'[TAGS_OPTIONS HERE]'`, JSON.stringify(tagsOptions || {}))
    .replace(`'[SERVER_CHANNEL_URL HERE]'`, JSON.stringify(serverChannelUrl))
    .replace('<!-- [HEAD HTML SNIPPET HERE] -->', headHtmlSnippet || '')
    .replace('<!-- [BODY HTML SNIPPET HERE] -->', bodyHtmlSnippet || '');
}
