// Mirrors what parcel-resolver-storybook emits for each `story:` glob: an object
// of `() => import('./Foo.stories.tsx')` async loaders. rewriteStoryVirtuals
// renames this file's STORY_VIRTUAL_RE-matching path to ./storybook-stories.js
// in the emitted stats.
module.exports = {
  './Button.stories.tsx': () => import('../../Button.stories.tsx')
};
