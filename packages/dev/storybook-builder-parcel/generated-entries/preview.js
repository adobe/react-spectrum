
  import { setup } from 'storybook/internal/preview/runtime';

  setup();

  import { createBrowserChannel } from 'storybook/internal/channels';
  import { addons } from 'storybook/internal/preview-api';

  const channel = createBrowserChannel({ page: 'preview' });
  addons.setChannel(channel);
  window.__STORYBOOK_ADDONS_CHANNEL__ = channel;

  if (window.CONFIG_TYPE === 'DEVELOPMENT'){
    window.__STORYBOOK_SERVER_CHANNEL__ = channel;
  }

  import { composeConfigs, PreviewWeb } from 'storybook/internal/preview-api';
  import { isPreview } from 'storybook/internal/csf';

  const importers = {
      ...import("story:Li4vLi4vLi4vQHtyZWFjdC1hcmlhLHJlYWN0LXN0YXRlbHksc3BlY3RydW0taWNvbnN9Lyovc3Rvcmllcy8qLnN0b3JpZXMue2pzLGpzeCx0cyx0c3h9"),
...import("story:Li4vLi4vLi4vQHJlYWN0LXNwZWN0cnVtLyEoczIpL3N0b3JpZXMvKi5zdG9yaWVzLntqcyxqc3gsdHMsdHN4fQ=="),
...import("story:Li4vLi4vLi4vcmVhY3QtYXJpYS1jb21wb25lbnRzL3N0b3JpZXMvKi5zdG9yaWVzLntqcyxqc3gsdHMsdHN4fQ==")
    };

    async function importFn(path) {
      return importers[path]();
    }

  const getProjectAnnotations = async () => {
    const configs = await Promise.all([import('@storybook/react/dist/entry-preview.mjs'),
import('@storybook/react/preview'),
import('@storybook/addon-actions/preview'),
import('@storybook/addon-a11y/preview'),
import('../../../../.storybook/preview.js')])
    return composeConfigs(configs);
  }


  window.__STORYBOOK_PREVIEW__ = window.__STORYBOOK_PREVIEW__ || new PreviewWeb(importFn, getProjectAnnotations);

  window.__STORYBOOK_STORY_STORE__ = window.__STORYBOOK_STORY_STORE__ || window.__STORYBOOK_PREVIEW__.storyStore;


  module.hot.accept(() => {
    // importFn has changed so we need to patch the new one in
    window.__STORYBOOK_PREVIEW__.onStoriesChanged({ importFn });

    // getProjectAnnotations has changed so we need to patch the new one in
    window.__STORYBOOK_PREVIEW__.onGetProjectAnnotationsChanged({ getProjectAnnotations });
  });
 