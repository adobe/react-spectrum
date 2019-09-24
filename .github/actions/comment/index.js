const core = require('@actions/core');
const github = require('@actions/github');

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
run();

async function run() {
  try {
    console.log('github.context', github.context);
    console.log('github.context.repository', github.context.payload.repository.owner);

    await octokit.issues.createComment({
      ...github.context.payload.repository.owner,
      issue_number: github.context.payload.number,
      body: `Build successful! [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/${github.context.sha}/index.html)`
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}
