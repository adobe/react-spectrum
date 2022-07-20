const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const Octokit = require('@octokit/rest');
const octokit = new Octokit();
const oldAppStatsFile = 'old-build-stats.txt';
const oldPublishStatsFile = 'old-publish.json';

// TODO do we need creds?
// const octokit = new Octokit({
//   auth: `token ${process.env.GITHUB_TOKEN}`
// });

compareBuildAppSize().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

// Compares the example test app build size and the verdaccio published package sizes to the last release
async function compareBuildAppSize() {
  // Get the commit before the last publish commit
  // let res = await octokit.search.commits({q: 'Publish repo:adobe/react-spectrum'});
  // let {items} = res.data;
  // TODO: skip this step for now, uncomment when ready
  // let commit;
  // let commit = items && items[0]?.parents[0]?.sha;

  // if (false) {
  //   // Do the rest of the stuff
  //   let lastBuildStatUrl = `https://reactspectrum.blob.core.windows.net/reactspectrum/${commit}/verdaccio/app-size/build-stats.txt`;
  //   let lastPublishStatUrl = `https://reactspectrum.blob.core.windows.net/reactspectrum/${commit}/verdaccio/publish-stats/publish.json`;

  //   // TODO: replace URL with lastBuildStatURL. Also add a download for the lerna publish stats
  //   // await download(
  //   //   'https://reactspectrum.blob.core.windows.net/reactspectrum/1b40255f085e9a26ce0cf1ef88f130ea0a7a6350/verdaccio/app-size/build-stats.txt',
  //   //   path.join(__dirname, '..', oldAppStatsFile));
  //   // await download(
  //   //   'https://reactspectrum.blob.core.windows.net/reactspectrum/1b40255f085e9a26ce0cf1ef88f130ea0a7a6350/verdaccio/publish-stats/publish.json',
  //   //   path.join(__dirname, '..', oldPublishStatsFile));

  //   let lastAppStats = fs.readFileSync(oldAppStatsFile, 'utf8');
  //   let currentAppStats = fs.readFileSync('build-stats.txt', 'utf8');
  //   let regex = /(.*)\tbuild\/\n$/;
  //   let lastAppSize = lastAppStats.match(regex)[1];
  //   let currentAppSize = currentAppStats.match(regex)[1];

  //   fs.writeFileSync('size-diff.txt', `Built app size diff from last publish: ${currentAppSize - lastAppSize} kB`);

  //   let lastPackageStats = JSON.parse(fs.readFileSync(oldPublishStatsFile));
  //   let currentPackageStats = JSON.parse(fs.readFileSync('publish.json'));
  //   let verdaccioDBPath = path.join(__dirname, '..', 'storage', '.verdaccio-db.json');
  //   let publishedPackages = JSON.parse(fs.readFileSync(verdaccioDBPath), 'utf').list;

  //   let stream = fs.createWriteStream('size-diff.txt', {flags: 'a'});
  //   stream.write('\n Published package size differences in kB (old, new, diff)');
  //   for (let pkg of publishedPackages) {
  //     // For each pack grab the size from the last and current package stats data
  //     let currentSize = pkg in currentPackageStats && currentPackageStats[pkg];
  //     let lastSize = pkg in lastPackageStats && lastPackageStats[pkg];
  //     if (!lastSize) {
  //       lastSize = 0;
  //     }

  //     stream.write(`\n ${pkg}: ${lastSize}kB ${currentSize}kB ${currentSize - lastSize}kB`);
  //   }

  //   stream.end();
  // } else {
  //   // TODO throw error
  //   new Error('no commit found');
  // }
}

// function download(url, dest) {
//   return new Promise((resolve, reject) => {
//     // Check file does not exist yet before hitting network
//     fs.access(dest, fs.constants.F_OK, (err) => {
//       if (err === null) {
//         reject(new Error('File already exists'));
//       }
//       let request = https.get(url, response => {
//         if (response.statusCode === 200) {
//           const file = fs.createWriteStream(dest, { flags: 'wx' });
//           file.on('finish', () => resolve());
//           file.on('error', err => {
//             file.close();
//             if (err.code === 'EEXIST') {
//               reject(new Error('File already exists'));
//             } else {
//               fs.unlink(dest, () => reject(err.message)); // Delete temp file
//             }
//           });
//           response.pipe(file);
//         } else {
//           reject(new Error(`Server responded with ${response.statusCode}: ${response.statusMessage}`));
//         }
//       });

//       request.on('error', err => {
//         reject(new Error(err.message));
//       });
//     });
//   });
// }
