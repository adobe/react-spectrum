const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;
const fs = require('fs');
const Octokit = require('@octokit/rest');

const octokit = new Octokit();

run();

async function run() {
  let packages = exec('yarn workspaces list --json').toString().split(require('os').EOL).filter(Boolean).map((x) => JSON.parse(x));
  let commits = new Map();

  // Diff each package individually. Some packages might have been skipped during last release,
  // so we cannot simply look at the last tag on the whole repo.
  for (let name in packages) {
    let filePath = packages[name].location + '/package.json';
    let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!pkg.private) {
      // Diff this package since the last published version, according to the package.json.
      // The release script creates a tag for each package version.
      let tag = `${pkg.name}@${pkg.version}`;

      let args = [
        'log',
        `${tag}..HEAD`,
        '--pretty="%H%x00%aI%x00%an%x00%s"',
        packages[name].location,

        // filter out non-code changes
        ':!**/test/**',
        ':!**/stories/**',
        ':!**/chromatic/**'
      ];

      let res = spawn('git', args, {encoding: 'utf8'});
      if (res.stdout.length === 0) {
        continue;
      }

      for (let line of res.stdout.split('\n')) {
        if (line === '') {
          continue;
        }

        let info = line.replace(/^"|"$/g, '').split('\0');
        commits.set(info[0], info);
      }
    }
  }

  let sortedCommits = [...commits.values()].sort((a, b) => a[1] < b[1] ? -1 : 1);

  for (let commit of sortedCommits) {
    let message = '';
    let user = '';
    let pr;

    //look for commits with pr #
    let m = commit[3].match(/(.*?) \(#(\d+)\)$/);

    if (m) {
      let prId = m[2];
      message = m[1];

      let res = await octokit.request('GET /repos/adobe/react-spectrum/pulls/{pull}', { pull: prId });
      user = `[@${res.data.user.login}](${res.data.user.html_url})`;
      pr = `https://github.com/adobe/react-spectrum/pull/${prId}`;

    } else { // not a pr so just print what we know from the commit
      message = commit[3];
      user = commit[2];
    }
    console.log(`* ${message} - ${user}` + (pr ? ` - [PR](${pr})` : ''));
  }
}
