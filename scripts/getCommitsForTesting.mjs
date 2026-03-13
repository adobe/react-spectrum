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

  let s2PRs = [];
  let racPRs = [];
  let v3PRs = [];
  let otherPRs = [];

  for (let d of data) {
    let row = [];

    // Get the PR Title from the commit
    let regex = /\(#(\d+)\)/g;
    let messages = d.commit.message.split('\n');
    let title = messages[0];

    // Get info about the PR using PR number
    if (regex.test(title)) {
      let num = title.match(regex)[0].replace(/[()#]/g, '');
      let info = await getPR(num);
      let labels = new Set(info.data.labels.map(label => label.name));

      // Skip PR if it has the no testing label
      if (labels.has('no testing')) {
        continue;
      }

      let matches = [...validLabels].filter(name => labels.has(name));
      if (matches.length > 0) {
        let title = matches[0];

        if (title === 'documentation') {
          row.push('Docs');
        } else {
          row.push(matches[0]);
        }
      }

      // If there is no component label, use the title of the PR
      if (matches.length === 0) {
        row.push(removePRNumber(title));
      } 

      // Get testing instructions if it exists
      let content = info.data.body;
      let testInstructions = escapeCSV(extractTestInstructions(content));

      if (testInstructions.length > 300) {
        row.push('See PR for testing instructions');
      } else {
        row.push(testInstructions);
      }

      // Add PR url to the row
      row.push(info.data.html_url);

      // Add PR title for additional context
      row.push(removePRNumber(title));

      // Categorize commit into V3, RAC, S2, or other (utilizes labels on PR's to categorize)
      if (!labels.has('S2') && !labels.has('RAC') && !labels.has('v3')) {
        otherPRs.push(row);
      } else {
        if (labels.has('S2')) {
          s2PRs.push(row);
        } else if (labels.has('RAC')) {
          racPRs.push(row);
        } else if (labels.has('v3')) {
          v3PRs.push(row);
        }
      }
    }
  }

  // Prepare to write into CSV
  let csvRows = '';
  csvRows += 'V3 \n';
  for (let v3 of v3PRs) {
    csvRows += v3.join() + '\n';
  }

  csvRows += '\nRainbow \n';
  for (let s2 of s2PRs) {
    csvRows += s2.join() + '\n';
  }

  csvRows += '\nRAC \n';
  for (let rac of racPRs) {
    csvRows += rac.join() + '\n';
  }

  csvRows += '\nOther \n';
  for (let other of otherPRs) {
    csvRows += other.join() + '\n';
  }

  fs.writeFileSync('output.csv', csvRows, 'utf-8');
}

async function listCommits() {
  let args = parseArgs({options, allowPositionals: true});
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

  let startDate = new Date(start).toISOString();
  let endDate = new Date(end).toISOString();

  let res = await octokit.request(`GET /repos/adobe/react-spectrum/commits?sha=main&since=${startDate}&until=${endDate}`, {
    owner: 'adobe',
    repo: 'react-spectrum',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

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

      if (text.includes('test instructions')) {
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

  // Escape any internal double quotes
  let escaped = stringValue.replace(/"/g, '""');

  // Wrap in quotes so commas/newlines don't break the cell
  return `"${escaped}"`;
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
  'FocusScope',
  'Focus',
  'Overlays',
  'Overlay Positioning',
  'drag and drop',
  'ssr'
]);
