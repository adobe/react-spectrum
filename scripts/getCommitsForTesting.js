const Octokit = require('@octokit/rest');
const fs = require('fs');
let {parseArgs} = require('util');

const octokit = new Octokit();

let options = {
  startDate: {
    type: 'string'
  },
  endDate: {
    type: 'string'
  }
};

writeTestingCSV();

async function writeTestingCSV() {
  let data = await listCommits();
  let prs = [];
  for (let d of data) {
    let row = [];

    // Get the PR Title from the commit
    let regex = /\(#(\d+)\)/g;
    let messages = d.commit.message.split('\n');
    let title = messages[0];
    row.push(title)


    // Get info about the PR using PR number
    if (regex.test(title)) {
      let num = title.match(regex)[0].replace(/[\(\)#]/g, '');
      let info = await getPR(num);

      // Get testing instructions if it exists
      let content = info.data.body;
      const match = content.match(/## 📝 Test Instructions:\s*([\s\S]*?)(?=##|$)/);
      let testInstructions = '';
      if (match) {
        testInstructions = match[1];
        testInstructions = testInstructions.replace(/<!--[\s\S]*?-->/g, '');
        testInstructions = testInstructions.trim();
      }

      row.push(escapeCSV(testInstructions));
      row.push(info.data.html_url)
    }
    prs.push(row);
  }

  let csvRows = '';
  for (let pr of prs) {
    csvRows += pr.join();
    csvRows += '\n'
  }

  fs.writeFileSync('output.csv', csvRows, 'utf-8')

}

async function listCommits() {
  let args = parseArgs({options, allowPositionals: true});
  if (args.positionals.length < 2) {
    console.error('Expected at least two arguments');
    process.exit(1);
  }

  let start = args.positionals[0];
  let end = args.positionals[1];

  let startDate = new Date(start).toISOString();
  let endDate = new Date(end).toISOString();

  if (isNaN(startDate) || isNaN(endDate)) {
    console.error('Please verify that your date is correctly formatted')
  }

  let res = await octokit.request(`GET /repos/adobe/react-spectrum/commits?sha=main&since=${startDate}&until=${endDate}`, {
    owner: 'adobe',
    repo: 'react-spectrum',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  return res.data;
}

async function getPR(num) {
  let res = await octokit.request(`GET /repos/adobe/react-spectrum/pulls/${num}`, {
    owner: 'adobe',
    repo: 'react-spectrum',
    pull_number: `${num}`,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  return res
}

function escapeCSV(value) {
  if (!value) {
    return '';
  }

  // Normalize newlines for CSV compatibility
  let stringValue = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Escape any internal double quotes
  let escaped = stringValue.replace(/"/g, '""');

  // Wrap in quotes so commas/newlines don't break the cell
  return `"${escaped}"`;
}
