const core = require('@actions/core');
const github = require('@actions/github');

run();
async function run() {
  const title = core.getInput("pr-title")


  const context = github.context;
  if (context.payload.pull_request == null) {
      core.setFailed('No pull request found.');
      return;
  }

  core.info(
    `🔎 Checking if the title of this PR "${title}" meets the requirements ...`
  );

  if ((/^\[?wip\]?/i).test(title)) {
    core.info('This PR is marked as a WIP. Skipping validation');
  } 
  else if ((/^(fix|feat|build|chore|docs|test|refactor|ci|localize|bump|revert)(\(([A-Za-z])\w+\))?:/gmi).test(title)) {
    core.info('Success');
  }
  else {
    core.info('PR title validation failed. Please read our PR naming guide to see how to correctly name your PR');
    core.setFailed();
  }
}