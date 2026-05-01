import ExcelJS from 'exceljs';

// Prevent formula injection: strings starting with =, +, -, @, tab, or CR are
// formula triggers in spreadsheet software. Prefix with a space to neutralize.
function sanitizeExcelString(value) {
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(value)) {
    return ' ' + value;
  }
  return value;
}

const BUGS_NOTES_HEADER = ['Component', 'Priority', 'Comments', 'Status', 'Lib', 'Details', 'Platform(s)'];
const PRIORITY_OPTIONS = [
  'Fix now',
  'Needs ticket',
  'Investigate',
  'Not fixing',
  'Cannot reproduce',
  'Fixed',
  'Storybook',
  'Duplicate'
];

function buildBugsNotesSheet(workbook) {
  let sheet = workbook.addWorksheet('Bugs & Notes');

  sheet.columns = [
    {width: 25},
    {width: 18},
    {width: 50},
    {width: 18},
    {width: 15},
    {width: 50},
    {width: 25}
  ];
  sheet.getColumn(3).alignment = {wrapText: true, vertical: 'top'};
  sheet.getColumn(6).alignment = {wrapText: true, vertical: 'top'};

  let header = sheet.addRow(BUGS_NOTES_HEADER);
  header.font = {bold: true};

  let priorityValidation = {
    type: 'list',
    allowBlank: true,
    formulae: [`"${PRIORITY_OPTIONS.join(',')}"`]
  };
  for (let i = 2; i <= 500; i++) {
    sheet.getCell(`B${i}`).dataValidation = priorityValidation;
  }
}

function buildReleaseNotesSheet(workbook, {v3PRs, s2PRs, racPRs, otherPRs, offPRs}) {
  let sheet = workbook.addWorksheet('Release Notes');

  sheet.columns = [
    {width: 25},
    {width: 70},
    {width: 50},
    {width: 50}
  ];
  sheet.getColumn(2).alignment = {wrapText: true, vertical: 'top'};
  sheet.getColumn(4).alignment = {wrapText: true, vertical: 'top'};

  let groups = [
    ['RAC', racPRs],
    ['S2', s2PRs],
    ['V3', v3PRs],
    ['Other', otherPRs],
    ['Off PRs', offPRs]
  ];

  for (let [name, rows] of groups) {
    if (!rows || rows.length === 0) {
      continue;
    }

    let headingRow = sheet.addRow([name]);
    headingRow.getCell(1).font = {bold: true};

    for (let row of rows) {
      let sanitized = [sanitizeExcelString(row[0]), sanitizeExcelString(row[1]), null, sanitizeExcelString(row[3])];
      let added = sheet.addRow(sanitized);
      let url = row[2];
      if (url) {
        added.getCell(3).value = {text: url, hyperlink: url};
        added.getCell(3).font = {color: {argb: 'FF0563C1'}, underline: true};
      }
    }

    sheet.addRow([]);
  }
}

function buildPassFailSheet(workbook, {v3PRs, s2PRs, racPRs, otherPRs, offPRs}) {
  let sheet = workbook.addWorksheet('Pass-Fail');

  sheet.columns = [
    {width: 25},
    {width: 20},
    {width: 25},
    {width: 20},
    {width: 20},
    {width: 20},
    {width: 20},
    {width: 20}
  ];
  let categoryA = [
    {row: 1, label: 'Storybook'},
    {row: 2, label: 'S2 Docs'},
    {row: 3, label: 'RAC Docs'},
    {row: 4, label: 'S2 Storybook'},
    {row: 6, label: 'PRs'}
  ];

  for (let {row, label} of categoryA) {
    let cell = sheet.getCell(`A${row}`);
    cell.value = label;
    cell.font = {bold: true};
  }

  let docLinks = {
    'S2 Docs': {b: 'https://d1pzu54gtk2aed.cloudfront.net/', c: 'https://tinyurl.com/4m778kj3'},
    'RAC Docs': {b: 'https://d5iwopk28bdhl.cloudfront.net/', c: 'https://tinyurl.com/5ycw9yje'}
  };
  let linkFont = {color: {argb: 'FF0563C1'}, underline: true};
  for (let {row, label} of categoryA) {
    let links = docLinks[label];
    if (!links) {
      continue;
    }
    let bCell = sheet.getCell(`B${row}`);
    bCell.value = {text: links.b, hyperlink: links.b};
    bCell.font = linkFont;
    let cCell = sheet.getCell(`C${row}`);
    cCell.value = {text: links.c, hyperlink: links.c};
    cCell.font = linkFont;
  }

  let categoryE = [
    {row: 1, label: 'Test Apps'},
    {row: 2, label: 'Next'},
    {row: 3, label: 'CRA'},
    {row: 4, label: 'S2 Parcel'},
    {row: 5, label: 'S2 Webpack'},
    {row: 6, label: 'RAC Tailwind'}
  ];
  for (let {row, label} of categoryE) {
    sheet.getCell(`E${row}`).value = label;
  }

  let browserHeaders = [
    'Component',
    'Chrome macOS',
    'Firefox macOS',
    'Safari macOS',
    'Firefox Windows',
    'Edge Windows',
    'Safari iPhone',
    'Safari iPad',
    'Chrome Android'
  ];
  for (let i = 0; i < browserHeaders.length; i++) {
    let cell = sheet.getCell(10, i + 1);
    cell.value = browserHeaders[i];
    cell.font = {bold: true};
  }

  let groups = [
    ['RAC', racPRs],
    ['S2', s2PRs],
    ['V3', v3PRs],
    ['Other', otherPRs],
    ['Off PRs', offPRs]
  ];
  let nextRow = 11;
  let first = true;
  for (let [name, rows] of groups) {
    if (!rows || rows.length === 0) {
      continue;
    }
    if (!first) {
      nextRow++;
    }
    first = false;

    let headingCell = sheet.getCell(nextRow, 1);
    headingCell.value = name;
    headingCell.font = {bold: true};
    headingCell.alignment = {horizontal: 'left'};
    nextRow++;

    for (let row of rows) {
      let cell = sheet.getCell(nextRow, 1);
      cell.value = sanitizeExcelString(row[0]);
      cell.alignment = {horizontal: 'left'};
      nextRow++;
    }
  }

  let cfStyle = (argb) => ({
    fill: {type: 'pattern', pattern: 'solid', fgColor: {indexed: 64}, bgColor: {argb}}
  });
  sheet.addConditionalFormatting({
    ref: 'B11:I500',
    rules: [
      {priority: 1, type: 'containsText', operator: 'containsText', text: 'Passish', style: cfStyle('FFFFE599')},
      {priority: 2, type: 'containsText', operator: 'containsText', text: 'Failish', style: cfStyle('FFFFE599')},
      {priority: 3, type: 'containsText', operator: 'containsText', text: 'Pass',    style: cfStyle('FFB7E1CD')},
      {priority: 4, type: 'containsText', operator: 'containsText', text: 'Fail',    style: cfStyle('FFEA9999')}
    ]
  });

  sheet.views = [{state: 'frozen', ySplit: 10}];
}

function buildScreenshotsSheet(workbook) {
  let sheet = workbook.addWorksheet('Screenshots');

  sheet.columns = [
    {width: 25},
    {width: 60}
  ];
  sheet.properties.defaultRowHeight = 50;

  let header = sheet.addRow(['Component', 'Screenshot']);
  header.font = {bold: true};
  header.height = 50;
}

export async function createTestingSheet({v3PRs, s2PRs, racPRs, otherPRs, offPRs}) {
  let workbook = new ExcelJS.Workbook();

  buildPassFailSheet(workbook, {v3PRs, s2PRs, racPRs, otherPRs, offPRs});
  buildScreenshotsSheet(workbook);
  buildBugsNotesSheet(workbook);
  buildReleaseNotesSheet(workbook, {v3PRs, s2PRs, racPRs, otherPRs, offPRs});

  return workbook.xlsx.writeBuffer();
}
