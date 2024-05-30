const core = require('@actions/core');
const github = require('@actions/github');

run();
async function run() {
  const title = core.getInput("pr-title")
  const number = core.getInput("pr-number")
  const token = core.getInput("repo-token")
  const octokit = github.getOctokit(token)
  const context = github.context;

  if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
  }

  core.info(
    `🔎 Checking if the title of this PR "${title}" meets the requirements ...`
  );

  if ((/^update:?|^support:?|^feat(ure)?:?|^remove:?|^add:?|^fix:?|^bump:?|^docs:?|^pre-release:?|^revert:?/i).test(title)) {
    core.info('Success');
  } 
  else {
    core.info('Sorry this failed, please read our PR naming guide to see how to correctly name your PR');

    try {
    const {data} = await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: number,
      body: 'This failed, please read our [PR naming guide](https://www.google.com/)'
    });
    } catch (error) {
      core.setFailed(error)
    }
    core.setFailed();

  }
}