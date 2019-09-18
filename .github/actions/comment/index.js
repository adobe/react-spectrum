const core = require('@actions/core');
const github = require('@actions/github');

try {
  console.log(github.context);
} catch (error) {
  core.setFailed(error.message);
}

// Build successful! [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/$(git rev-parse HEAD)/index.html).