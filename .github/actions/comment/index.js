const core = require('@actions/core');
const github = require('@actions/github');

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
run();

async function run() {
  try {
    await octokit.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.payload.number,
      body: `Build successful! [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/${github.context.sha}/index.html)`
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}
