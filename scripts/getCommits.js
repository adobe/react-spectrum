const Octokit = require('@octokit/rest');

const octokit = new Octokit();

const startDate = new Date('2025-10-12').toISOString();
const endDate = new Date('2025-10-15').toISOString();

listCommits();

async function listCommits() {
  let res = await octokit.request(`GET /repos/adobe/react-spectrum/commits?sha=main&since=${startDate}&until=${endDate}`, {
    owner: 'adobe',
    repo: 'react-spectrum',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  let data = res.data;

  let pr = [];
  for (let d of data) {
    let regex = /\(#(\d+)\)/g;
    let messages = d.commit.message.split('\n');
    let m = messages[0];
    if (regex.test(m)) {
      pr.push(m.match(regex)[0])
    }
  }

  console.log(pr);


}