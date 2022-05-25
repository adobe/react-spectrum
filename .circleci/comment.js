const Octokit = require('@octokit/rest');

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
});

run();

async function run() {
  let pr;
  // If we aren't running on a PR commit, double check if this is a branch created for a fork. If so, we'll need to
  // comment the build link on the fork.
  if (!process.env.CIRCLE_PULL_REQUEST) {
    try {
      const commit = await octokit.git.getCommit({
        owner: 'adobe',
        repo: 'react-spectrum',
        commit_sha: process.env.CIRCLE_SHA1
      });

      // Check if it is a merge commit from the github "Branch from fork action"
      if (commit && commit.data?.parents?.length === 2 && commit.data.message.indexOf('Merge') > -1) {
        // Unfortunately listPullRequestsAssociatedWithCommit doesn't return fork prs so have to use search api
        // to find the fork PR the original commit lives in
        const forkHeadCommit = commit.data.parents[1].sha;
        const searchRes = await octokit.search.issuesAndPullRequests({
          q: `${forkHeadCommit}+repo:adobe/react-spectrum+is:pr+is:open`
        });

        // Look for a PR that is from a fork and has a matching head commit as the current branch
        const pullNumbers = searchRes.data.items.filter(i => i.pull_request !== undefined).map(j => j.number);
        for (let pull_number of pullNumbers) {
          const {data} = await octokit.pulls.get({
            owner: 'adobe',
            repo: 'react-spectrum',
            pull_number
          });
          if (data && data.head.repo.full_name !== 'adobe/react-spectrum' && data.head.sha === forkHeadCommit) {
            pr = pull_number;
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  } else {
    pr = process.env.CIRCLE_PULL_REQUEST.split('/').pop();
  }

  if (pr != null) {
    await octokit.issues.createComment({
      owner: 'adobe',
      repo: 'react-spectrum',
      issue_number: pr,
      body: `Build successful! 🎉

  * [View the storybook](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/storybook/index.html)
  * [View the storybook-17](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/storybook-17/index.html)
  * [View the storybook-16](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/storybook-16/index.html)
  * [View the documentation](https://reactspectrum.blob.core.windows.net/reactspectrum/${process.env.CIRCLE_SHA1}/docs/index.html)`
    });
  }
}
