const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const Octokit = require('@octokit/rest');
const octokit = new Octokit();
const currentAppStatsFile = 'build-stats.txt';
const currentPublishStatsFile = 'publish.json';
const lastAppStatsFile = 'old-build-stats.txt';
const lastPublishStatsFile = 'old-publish.json';

compareBuildAppSize().catch(err => {
  console.error(err.stack);
  process.exit(1);
});

// Compares the example test app build size and the verdaccio published package sizes to the last release
async function compareBuildAppSize() {
  // Get the commit before the last publish commit
  let res = await octokit.search.commits({q: 'Publish repo:adobe/react-spectrum'});
  let {items} = res.data;
  let commit = items && items[0]?.parents[0]?.sha;

  if (commit) {
    // Attempt to pull stats from last publish commit. If they don't exist, pull from a hardcoded commit (fallback until these records are generated for a first publish w/ this script)
    let lastAppStatUrl = `https://reactspectrum.blob.core.windows.net/reactspectrum/${commit}/verdaccio/rsp-cra-18/publish-stats/${currentAppStatsFile}`;
    let lastPublishStatUrl = `https://reactspectrum.blob.core.windows.net/reactspectrum/${commit}/verdaccio/rsp-cra-18/publish-stats/${currentPublishStatsFile}`;
    let lastAppStatPath = path.join(__dirname, '..', lastAppStatsFile);
    let lastPublishStatPath = path.join(__dirname, '..', lastPublishStatsFile);
    await download(lastAppStatUrl, lastAppStatPath);
    await download(lastPublishStatUrl, lastPublishStatPath);

    if (!fs.existsSync(lastAppStatPath)) {
      // TODO: placeholder until we get some real stats. Hardcoded URL pointing to a commit with actual data
      await download(
        `https://reactspectrum.blob.core.windows.net/reactspectrum/2504f8ad927d0d0ad55e7e6db8a22fec16a67b6f/verdaccio/publish-stats/${currentAppStatsFile}`,
        lastAppStatPath);
    }

    if (!fs.existsSync(lastPublishStatPath)) {
      await download(
        `https://reactspectrum.blob.core.windows.net/reactspectrum/2504f8ad927d0d0ad55e7e6db8a22fec16a67b6f/verdaccio/publish-stats/${currentPublishStatsFile}`,
        lastPublishStatPath);
    }

    // Extract the built example app size from the current commit and the last publish commit data
    let lastAppStats = fs.readFileSync(lastAppStatsFile, 'utf8');
    let currentAppStats = fs.readFileSync(currentAppStatsFile, 'utf8');
    let regex = /(.*)\tbuild\/\n$/;
    let lastAppSize = lastAppStats.match(regex)[1];
    let currentAppSize = currentAppStats.match(regex)[1];
    fs.writeFileSync('size-diff.txt', `Built app size diff from last publish: ${(currentAppSize - lastAppSize).toFixed(2)} kB`);

    let lastPackageStats = JSON.parse(fs.readFileSync(lastPublishStatsFile));
    let currentPackageStats = JSON.parse(fs.readFileSync(currentPublishStatsFile));
    let stream = fs.createWriteStream('size-diff.txt', {flags: 'a'});
    stream.write('\n');
    stream.write('\nPublished package size differences from last publish in kB (old, new, diff). Packages with size differences less than .01kB are omitted.');
    for (let pkg of Object.keys(currentPackageStats)) {
      // For each package grab the size from the last and current package stats data
      let currentSize = pkg in currentPackageStats && currentPackageStats[pkg];
      let lastSize = pkg in lastPackageStats && lastPackageStats[pkg];
      if (!lastSize) {
        lastSize = 0;
      }

      let diff = (currentSize - lastSize).toFixed(2);
      if (Math.abs(diff) > 0) {
        stream.write(`\n${pkg}: ${lastSize}kB   ${currentSize}kB   ${diff}kB`);
      }
    }

    stream.end();
    console.log('Finished writing size-diff.txt');
  } else {
    new Error('no commit found');
  }
}

// Resolve only so that we can attempt a hardcoded link download if the commit one fails. TODO: revert back to reject when we get some intial data from a publish.
function download(url, dest) {
  return new Promise((resolve, reject) => {
    // Check file does not exist yet before hitting network
    fs.access(dest, fs.constants.F_OK, (err) => {
      if (err === null) {
        console.error(`File already exists at ${dest}`);
        resolve();
      }
      let request = https.get(url, response => {
        if (response.statusCode === 200) {
          const file = fs.createWriteStream(dest, {flags: 'wx'});
          file.on('finish', () => resolve());
          file.on('error', err => {
            file.close();
            if (err.code === 'EEXIST') {
              console.error(`File was created during the request call at ${dest}`);
              resolve();
            } else {
              // Delete temp file
              fs.unlink(dest, () => {
                console.error(err.message);
                resolve();
              });
            }
          });
          response.pipe(file);
        } else {
          console.error(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
          resolve();
        }
      });

      request.on('error', err => {
        console.error(err);
        resolve();
      });
    });
  });
}
