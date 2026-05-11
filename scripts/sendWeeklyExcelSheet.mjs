import {createTestingSheet} from './createExcelSheet.mjs';
import {generateData} from './getCommitsForTesting.mjs';
import {parseArgs} from 'node:util';

const SLACK_TESTING_BOT_TOKEN = process.env.SLACK_TESTING_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

if (!SLACK_TESTING_BOT_TOKEN || !SLACK_CHANNEL_ID) {
  console.error('Missing required env vars: SLACK_BOT_TOKEN, SLACK_CHANNEL_ID');
  process.exit(1);
}

function getPreviousWeekRange() {
  let today = new Date();
  let endDate = new Date(today);
  endDate.setDate(today.getDate() - 1);

  let startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);

  function fmt(d) {
    return d.toISOString().split('T')[0];
  }

  return {startDate: fmt(startDate), endDate: fmt(endDate)};
}

function formatDateLabel(dateStr) {
  let d = new Date(dateStr + 'T12:00:00Z');
  let mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  let dd = String(d.getUTCDate()).padStart(2, '0');
  let yyyy = String(d.getUTCFullYear());
  return `${yyyy}.${mm}.${dd}`;
}

async function uploadToSlack(buffer, filename, message) {
  // Step 1: get upload URL
  let urlRes = await fetch('https://slack.com/api/files.getUploadURLExternal', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_TESTING_BOT_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({filename, length: buffer.byteLength}),
    signal: AbortSignal.timeout(30000)
  });
  let urlData = await urlRes.json();
  if (!urlData.ok) {
    throw new Error(`Failed to initialize Slack file upload: ${urlData.error}`);
  }

  let parsedUploadUrl = new URL(urlData.upload_url);
  if (parsedUploadUrl.protocol !== 'https:' || parsedUploadUrl.hostname !== 'files.slack.com') {
    throw new Error('Unexpected upload URL');
  }
  // Step 2: upload file bytes
  let uploadRes = await fetch(urlData.upload_url, {
    method: 'POST',
    headers: {'Content-Type': 'application/octet-stream'},
    body: buffer,
    signal: AbortSignal.timeout(30000)
  });
  if (!uploadRes.ok) {
    throw new Error(`File upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
  }

  // Step 3: complete upload and share to channel
  let completeRes = await fetch('https://slack.com/api/files.completeUploadExternal', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SLACK_TESTING_BOT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: [{id: urlData.file_id}],
      channel_id: SLACK_CHANNEL_ID,
      initial_comment: message
    }),
    signal: AbortSignal.timeout(30000)
  });
  let completeData = await completeRes.json();
  if (!completeData.ok) {
    throw new Error(`Failed to complete Slack file upload: ${completeData.error}`);
  }
}

async function main() {
  let args = parseArgs({allowPositionals: true});
  let {startDate, endDate} = (() => {
    if (args.positionals.length === 0) {
      return getPreviousWeekRange();
    }
    if (args.positionals.length < 2) {
      console.error('Expected two date arguments: <startDate> <endDate>');
      process.exit(1);
    }
    let start = new Date(args.positionals[0]);
    let end = new Date(args.positionals[1]);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Please verify that your dates are correctly formatted (YYYY-MM-DD)');
      process.exit(1);
    }
    return {startDate: args.positionals[0], endDate: args.positionals[1]};
  })();
  console.log(`Generating testing sheet for ${startDate} – ${endDate}...`);

  let {v3PRs, s2PRs, racPRs, otherPRs, offPRs, counts} = await generateData(startDate, endDate);
  console.log(
    `Found: V3=${counts.v3}, S2=${counts.s2}, RAC=${counts.rac}, Other=${counts.other}, Off PRs=${counts.offPRs}`
  );

  let buffer = await createTestingSheet({v3PRs, s2PRs, racPRs, otherPRs, offPRs});

  let startLabel = formatDateLabel(startDate);
  let endLabel = formatDateLabel(endDate);
  let total = counts.v3 + counts.s2 + counts.rac + counts.other;
  let filename = `${endLabel}.xlsx`;
  let message = `*Testing sheet for ${startLabel} – ${endLabel}*\nV3: ${counts.v3} | S2: ${counts.s2} | RAC: ${counts.rac} | Other: ${counts.other} | Off PR: ${counts.offPRs} | Total: ${total}`;

  await uploadToSlack(buffer, filename, message);
  console.log('Posted to Slack successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
