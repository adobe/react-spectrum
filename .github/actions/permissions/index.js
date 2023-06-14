const core = require('@actions/core');
const github = require('@actions/github');

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
run();
async function run() {
  const context = github.context;
  try {
    // Get permission level of actor
    const {data} = await octokit.repos.getCollaboratorPermissionLevel({
      ...context.repo,
      username: context.actor
    });

    if (!['admin','write'].includes(data.permission)) {
      core.setFailed('User doesn\'t have write permissions or higher');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
