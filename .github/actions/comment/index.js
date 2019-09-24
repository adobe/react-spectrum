const core = require('@actions/core');
const github = require('@actions/github');

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
run();

async function run() {
  try {
    let res = await octokit.repos.listPullRequestsAssociatedWithCommit({
      ...github.context.repo,
      commit_sha: github.context.sha
    });
    console.log('github.context', github.context);
    console.log('in try', prs);
    console.log('res', res);
    if (!prs) {
      return;
    }

    await octokit.issues.createComment({
      ...github.context.repo,
      issue_number: prs[0].number,
      body: `Build successful! [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/${github.context.sha}/index.html)`
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}
