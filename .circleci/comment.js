const Octokit = require('@octokit/rest');

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
});

run();

async function run() {
  if (!process.env.CIRCLE_PULL_REQUEST) {
    await octokit.repos.createCommitComment({
      owner: 'adobe',
      repo: 'react-spectrum',
      commit_sha: process.env.CIRCLE_SHA1,
      body: `Verdaccio builds:
  [Test App](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/verdaccio/build/index.html)
  [Docs](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/verdaccio/docs/index.html)
  [Docs Diff](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/dashboard/build/index.html)`
    });
  } else {
    let pr = process.env.CIRCLE_PULL_REQUEST.split('/').pop();
    await octokit.issues.createComment({
      owner: 'adobe',
      repo: 'react-spectrum',
      issue_number: pr,
      body: `Build successful! 🎉

  * [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/storybook/index.html)
  * [View the storybook-17](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/storybook-17/index.html)
  * [View the documentation](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/docs/index.html)`
    });
  }
}
