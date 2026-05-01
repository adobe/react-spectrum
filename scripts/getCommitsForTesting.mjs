import Octokit from '@octokit/rest';
import fs from 'fs';
import {parseArgs} from 'node:util';
import remarkParse from 'remark-parse';
import {toString} from 'mdast-util-to-string';
import {unified} from 'unified';

/**
 * Instructions:
 * 
 * 1. Run the following script: node scripts/getCommitsForTesting.mjs 2026-10-07 2026-10-18
 * 2. Go to output.csv, copy it to Google sheets, highlight the rows, go to "Data" in the toolbar -> split text to columns -> separator: comma
 */

const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
});

if (process.argv[1].endsWith('getCommitsForTesting.mjs')) {
  writeTestingCSV().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

async function writeTestingCSV() {
  let args = parseArgs({allowPositionals: true});
  if (args.positionals.length < 2) {
    console.error('Expected at least two arguments');
    process.exit(1);
  }

  let start = new Date(args.positionals[0]);
  let end = new Date(args.positionals[1]);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Please verify that your date is correctly formatted');
    process.exit(1);
  }

  let {csv} = await generateCSV(args.positionals[0], args.positionals[1]);
  fs.writeFileSync('output.csv', csv, 'utf-8');
}

export async function generateData(startDate, endDate) {
  let data = await listCommits(startDate, endDate);

  // First pass: extract PR numbers from commit messages
  let commitsWithPRs = [];
  for (let d of data) {
    let title = d.commit.message.split('\n')[0];
    let match = title.match(/\(#(\d+)\)/);
    if (match) {
      commitsWithPRs.push({title, num: match[1]});
    }
  }

  // Fetch all PRs in parallel, tolerating individual failures
  let settled = await Promise.allSettled(commitsWithPRs.map(({num}) => getPR(num)));

  // Second pass: categorize by label
  let s2PRs = [];
  let racPRs = [];
  let v3PRs = [];
  let otherPRs = [];
  let offPRs = [];

  for (let i = 0; i < commitsWithPRs.length; i++) {
    let {title, num} = commitsWithPRs[i];
    let result = settled[i];
    if (result.status === 'rejected') {
      console.warn(`Failed to fetch PR #${num}: ${result.reason}`);
      continue;
    }
    let info = result.value;
    let labels = new Set(info.data.labels.map(label => label.name));

    if (labels.has('no testing')) {
      continue;
    }

    let row = [];
    let matches = [...validLabels].filter(name => labels.has(name));
    if (matches.length > 0) {
      if (matches.includes('documentation')) {
        row.push('Docs');
      } else {
        row.push(matches.sort().join('/'));
      }
    }

    if (matches.length === 0) {
      row.push(removePRNumber(title));
    }

    let content = info.data.body;
    let testInstructions = extractTestInstructions(content);
    row.push(testInstructions.length > 300 ? 'See PR for testing instructions' : testInstructions);
    row.push(info.data.html_url);
    row.push(removePRNumber(title));

    if (!labels.has('S2') && !labels.has('RAC') && !labels.has('v3') && !labels.has('test off PR')) {
      otherPRs.push(row);
    } else if (labels.has('test off PR')) {
      offPRs.push(row);
    } else {
      if (labels.has('S2')) {
        s2PRs.push(row);
      }
      if (labels.has('RAC')) {
        racPRs.push(row);
      }
      if (labels.has('v3')) {
        v3PRs.push(row);
      }
    }
  }

  return {
    v3PRs,
    s2PRs,
    racPRs,
    otherPRs,
    offPRs,
    counts: {v3: v3PRs.length, s2: s2PRs.length, rac: racPRs.length, offPRs: offPRs.length, other: otherPRs.length}
  };
}

export async function generateCSV(startDate, endDate) {
  let {v3PRs, s2PRs, racPRs, otherPRs, offPRs, counts} = await generateData(startDate, endDate);

  function formatRows(rows) {
    return rows.map(([component, instructions, url, title]) =>
      [escapeCSV(component), escapeCSV(instructions), url, escapeCSV(title)].join()
    ).join('\n');
  }

  let csv = `V3 \n${formatRows(v3PRs)}\n\nRainbow \n${formatRows(s2PRs)}\n\nRAC \n${formatRows(racPRs)}\n\nOff PR \n${formatRows(offPRs)}\n\nOther \n${formatRows(otherPRs)}\n`;

  return {csv, counts};
}

async function listCommits(startDate, endDate) {
  let start = new Date(startDate);
  let end = new Date(endDate + 'T23:59:59.999Z');

  let allCommits = [];
  let page = 1;
  let lastPageSize;
  do {
    let res = await octokit.repos.listCommits({
      owner: 'adobe',
      repo: 'react-spectrum',
      sha: 'main',
      since: start.toISOString(),
      until: end.toISOString(),
      per_page: 100,
      page
    });
    allCommits.push(...res.data);
    lastPageSize = res.data.length;
    page++;
  } while (lastPageSize === 100);

  return allCommits;
}

async function getPR(num) {
  let res = await octokit.pullRequests.get({
    owner: 'adobe',
    repo: 'react-spectrum',
    pull_number: Number(num)
  });
  return res;
}

function getHeadingText(node) {
  return node.children
    .map(child => child.value || '')
    .join('')
    .trim();
}

function extractTestInstructions(contents) {
  if (!contents) {
    return '';
  }

  let tree = unified().use(remarkParse).parse(contents);

  let collecting = false;
  let headingDepth = null;
  let collected = [];

  for (let node of tree.children) {
    if (node.type === 'heading') {
      let text = getHeadingText(node).toLowerCase();

      if (/test(?:ing)? instructions?/.test(text)) {
        collecting = true;
        headingDepth = node.depth;
        continue;
      }

      // Stop when we reach another heading of same or higher level
      if (collecting && node.depth <= headingDepth) {
        break;
      }
    }

    if (collecting) {
      collected.push(node);
    }

  }

  return collected.map(node => toString(node)).join(' ').replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
}


function escapeCSV(value) {
  if (!value) {
    return '';
  }

  // Normalize newlines for CSV compatibility
  let stringValue = String(value).replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Prevent formula injection when opened in Excel/Google Sheets
  if (/^[=+\-@\t\r]/.test(stringValue)) {
    stringValue = `'${stringValue}`;
  }

  // Escape any internal double quotes and wrap in quotes so commas/newlines don't break the cell
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function removePRNumber(title) {
  return title.replace(/\s*\(#\d+\)\s*$/, '');
}

let validLabels = new Set([
  'Accordion',
  'ActionBar',
  'ActionButton',
  'ActionButtonGroup',
  'ActionMenu',
  'Autocomplete',
  'Avatar',
  'AvatarGroup',
  'Badge',
  'Breadcrumbs',
  'Button',
  'ButtonGroup',
  'Calendar',
  'Card',
  'CardView',
  'Checkbox',
  'CheckboxGroup',
  'ColorArea',
  'ColorField',
  'ColorPicker',
  'ColorSlider',
  'ColorSwatch',
  'ColorSwatchPicker',
  'ColorWheel',
  'ComboBox',
  'ContextualHelp',
  'DateField',
  'DatePicker',
  'DateRangePicker',
  'Dialog',
  'Disclosure',
  'DisclosureGroup',
  'Divider',
  'DropZone',
  'FileTrigger',
  'FocusRing',
  'FocusScope',
  'Form',
  'GridList',
  'Group',
  'I18nProvider',
  'IllustratedMessage',
  'Image',
  'InlineAlert',
  'Link',
  'LinkButton',
  'ListBox',
  'Menu',
  'Meter',
  'Modal',
  'NumberField',
  'Picker',
  'Popover',
  'PortalProvider',
  'ProgressBar',
  'ProgressCircle',
  'Provider',
  'RadioGroup',
  'RangeCalendar',
  'RangeSlider',
  'SearchField',
  'SegmentedControl',
  'Select',
  'SelectBoxGroup',
  'Separator',
  'Skeleton',
  'Slider',
  'SSRProvider',
  'StatusLight',
  'Switch',
  'Table',
  'TableView',
  'Tabs',
  'TagGroup',
  'TextArea',
  'TextField',
  'TimeField',
  'Toast',
  'ToggleButton',
  'ToggleButtonGroup',
  'Toolbar',
  'Tooltip',
  'Tree',
  'TreeView',
  'Virtualizer',
  'VisuallyHidden',
  'documentation',
  'usePress',
  'scrollIntoView',
  'ResizeObserver',
  'Focus',
  'Overlays',
  'Overlay Positioning',
  'drag and drop',
  'ssr'
]);
