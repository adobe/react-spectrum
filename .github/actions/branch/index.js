const core = require('@actions/core');
const github = require('@actions/github');

const octokit = new github.GitHub(process.env.GITHUB_TOKEN);
run();
// Creates a branch off a fork PR
async function run() {
  const context = github.context;
  try {
    // Get info of the fork PR
    const prNumber = context.issue.number;
    const {data} = await octokit.pulls.get({
      ...context.repo,
      pull_number: prNumber
    });

    // Only create/update a branch if the PR from a fork
    if (data.head.repo.full_name !== context.payload.repository.full_name) {
      const branch = `${data.user.login}-${data.head.ref}`;
      const ref = `refs/heads/${branch}`;
      const sha = data.merge_commit_sha;

      let res;
      // Look up if branch for fork PR exists in base repo
      try {
        res = await octokit.repos.getBranch({
          ...context.repo,
          branch
        });
      } catch (error) {
        if (!(error.name === 'HttpError' && error.status === 404)) {
          throw error;
        } else {
          // If branch doesn't exist for the forked PR, create one so we can get a
          // build for it and return
          await octokit.git.createRef({
            ...context.repo,
            ref,
            sha
          });
          return;
        }
      }

      // If branch already exists update it to match fork PR state.
      if (res.status === 200) {
        await octokit.git.updateRef({
          ...context.repo,
          sha,
          ref: `heads/${branch}`,
          force: true
        })
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}
