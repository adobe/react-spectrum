const Octokit = require('@octokit/rest');
const fs = require('fs');

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
});

run();

let commentKey = '<!-- APIDifferComment -->';

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
    let commentId = await findDifferComment(pr);
    let diffs;
    try {
      diffs = fs.readFileSync('/tmp/dist/ts-diff.txt');
    } catch (e) {
      console.log('No TS Diff output to run on.')
      return;
    }
    if (diffs.length > 0) {
      if (commentId != null) {
        // delete existing comment
        await octokit.issues.deleteComment({
          owner: 'adobe',
          repo: 'react-spectrum',
          comment_id: commentId,
          body: `${commentKey}## API Changes
${diffs}
`
        })
      }
      // create new comment
      await octokit.issues.createComment({
        owner: 'adobe',
        repo: 'react-spectrum',
        issue_number: pr,
        body: `${commentKey}## API Changes
${diffs}
`
      });
    } else if (commentId != null) {
      // delete existing comment, it no longer applies
      await octokit.issues.deleteComment({
        owner: 'adobe',
        repo: 'react-spectrum',
        comment_id: commentId
      });
    }
  }
}

async function findDifferComment(pr, page = 1) {
  let comments = null;
  try {
    comments = await octokit.issues.listComments({
      owner: 'adobe',
      repo: 'react-spectrum',
      issue_number: pr,
      page
    });
  } catch (err) {
    console.log(err);
    return null;
  }

  let commentId;
  for (let comment of comments.data) {
    if (comment.body.includes(commentKey)) {
      commentId = comment.id;
      break;
    }
  }
  // default results per page is 30
  if (commentId == null && comments.data.length === 30) {
    commentId = await findDifferComment(pr, page + 1);
  }
  return commentId;
}
