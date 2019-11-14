const Octokit = require('@octokit/rest');

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
});

run();

async function run() {
  if (!process.env.CIRCLE_PR_NUMBER) {
    return;
  }

  await octokit.issues.createComment({
    owner: 'adobe',
    repo: 'react-spectrum-v3',
    issue_number: process.env.CIRCLE_PR_NUMBER,
    body: `Build successful! [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/index.html)`
  });
}
