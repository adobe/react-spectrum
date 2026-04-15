/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/**
 * Scrapes CLDR language plural rules comparison tables (see unicode.org/cldr/charts/…/supplemental/language_plural_rules.html#comparison)
 * and generates the list of sample values NumberParser needs for formatToParts across locales.
 *
 * Usage:
 *   node scripts/generateAllPlurals.mjs [chartsPathSegment]   # default: latest
 *   node scripts/generateAllPlurals.mjs 48
 *   node scripts/generateAllPlurals.mjs --json [chartsPathSegment]
 *   node scripts/generateAllPlurals.mjs --maintenance
 *
 * --maintenance: compares https://cldr.unicode.org/index/downloads to NumberParser.ts, re-scrapes via "latest" charts, updates the file when a newer CLDR release exists.
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {JSDOM} from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NUMBER_PARSER = path.join(__dirname, '../packages/@internationalized/number/src/NumberParser.ts');
const DOWNLOADS_URL = 'https://cldr.unicode.org/index/downloads';

function getRange(row) {
  let range = [];

  let th = row.firstElementChild;

  do {
    const {textContent} = th;

    let [start, end = start] = textContent.split('-');

    if (start === '') {
      range.push([]);
    } else {
      start = start.replace(/\.x$/, '.1');
      end = end.replace(/\.x$/, '.1');

      range.push([Number(start), Number(end)]);
    }
  } while ((th = th.nextElementSibling));

  return range;
}

function getLocales(cell) {
  let locales = [];

  let element = cell.firstElementChild;

  do {
    if (element.tagName === 'SPAN') {
      locales.push(element.title);
    }
  } while ((element = element.nextElementSibling));

  return locales;
}

function getPlurals(tr, range) {
  let columnTitles = [...tr.childNodes].map((td) => td.title);
  let rules = Object.fromEntries(columnTitles.map((key) => [key, []]));

  let td = tr.firstElementChild;

  let index = 1;

  do {
    const category = td.title;

    let columns = td.hasAttribute('colspan')
      ? Number(td.getAttribute('colspan'))
      : 1;

    do {
      rules[category].push(range[index]);

      index++;
    } while (columns-- > 1);
  } while ((td = td.nextElementSibling));

  return rules;
}

function extractTable(dom, integerTable, fractionTable) {
  function extract(table) {
    const tbody = table.querySelector('tbody');

    let tr = tbody.firstElementChild;

    let current;
    let results = {};

    do {
      if (tr.firstElementChild.tagName === 'TH') {
        if (current) {
          for (const language of current.languages) {
            if (!results[language]) {
              results[language] = Object.fromEntries(
                Object.keys(current.rules).map((key) => [key, []])
              );
            }

            for (let rule in current.rules) {
              results[language][rule] = [].concat(
                results[language][rule],
                current.rules[rule]
              );
            }
          }
        }

        current = {
          range: [],
          languages: [],
          rules: {},
        };

        current.range = getRange(tr);
      } else if (
        tr.children[1] instanceof dom.window.HTMLTableCellElement &&
        tr.children[1].classList.contains('l')
      ) {
        current.languages = getLocales(tr.children[1]);
      } else {
        current.rules = getPlurals(tr, current.range);
      }
    } while ((tr = tr.nextElementSibling));

    return results;
  }

  const integer = extract(integerTable);
  const fraction = extract(fractionTable);

  let values = new Set();

  for (let language in integer) {
    for (let rule in integer[language]) {
      if (integer[language][rule].length > 1) {
        values.add(integer[language][rule][0][0]);
      }
    }
  }

  for (let language in fraction) {
    for (let rule in fraction[language]) {
      if (fraction[language][rule].length > 1) {
        values.add(fraction[language][rule][0][0]);
      }
    }
  }

  return Array.from(values);
}

export async function scrapePluralNumbers(chartsPathSegment) {
  const url = `https://www.unicode.org/cldr/charts/${chartsPathSegment}/supplemental/language_plural_rules.html#comparison`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const finalUrl = response.url;
  const data = await response.text();
  const dom = new JSDOM(data);
  const tables = dom.window.document.querySelectorAll('.pluralComp');
  if (tables.length < 2) {
    throw new Error(`Expected at least 2 .pluralComp tables, found ${tables.length} at ${finalUrl}`);
  }
  const integerTable = tables[0];
  const fractionTable = tables[1];
  const values = extractTable(dom, integerTable, fractionTable);
  return {values, chartUrl: finalUrl};
}

function compareRelease(a, b) {
  const pa = a.split('.').map((x) => parseInt(x, 10));
  const pb = b.split('.').map((x) => parseInt(x, 10));
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) {
      return da - db;
    }
  }
  return 0;
}

async function latestReleaseFromDownloads() {
  const res = await fetch(DOWNLOADS_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${DOWNLOADS_URL}: ${res.status}`);
  }
  const html = await res.text();
  const re = /<td style="text-align: center">(\d+(?:\.\d+)*)<\/td>/g;
  let m;
  let best = null;
  while ((m = re.exec(html)) !== null) {
    const v = m[1];
    if (best === null || compareRelease(v, best) > 0) {
      best = v;
    }
  }
  if (!best) {
    throw new Error('Could not parse any CLDR release version from downloads page');
  }
  return best;
}

function readLastCheckedRelease(tsSource) {
  const m = tsSource.match(/@cldr-plural-meta\s+release=([0-9.]+)/);
  return m ? m[1] : null;
}

function formatPluralNumbersArray(values) {
  const body = values.map((n) => (Number.isInteger(n) ? String(n) : String(n))).join(', ');
  return `[\n  ${body}\n]`;
}

/** Parses `const pluralNumbers = [...]` array literal from NumberParser source. */
function parsePluralNumbersFromTs(tsSource) {
  const m = tsSource.match(/const pluralNumbers = (\[[\s\S]*?\]);/);
  if (!m) {
    return null;
  }
  const inner = m[1].trim().slice(1, -1).trim();
  if (!inner) {
    return [];
  }
  return inner.split(',').map((part) => parseFloat(part.trim())).filter((n) => !Number.isNaN(n));
}

/** True if the two lists are the same set of numbers. */
function samePluralNumbers(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  const sort = (xs) => [...xs].sort((x, y) => x - y);
  const as = sort(a);
  const bs = sort(b);
  for (let i = 0; i < as.length; i++) {
    if (as[i] !== bs[i]) {
      return false;
    }
  }
  return true;
}

function applyNumberParserUpdate(tsSource, {release, chartUrl, values}) {
  const meta = `// @cldr-plural-meta release=${release} chart=${chartUrl}`;
  const pluralBlock = `${meta}
// This list is derived from the CLDR language plural rules comparison chart and includes
// all unique numbers which we need to check in order to determine all the plural forms for a given locale.
// See: https://github.com/adobe/react-spectrum/pull/5134/files#r1337037855 (scripts/generateAllPlurals.mjs)
const pluralNumbers = ${formatPluralNumbersArray(values)};`;

  const re = /\/\/ @cldr-plural-meta release=[^\n]+\n(?:\/\/[^\n]*\n)*const pluralNumbers = \[[\s\S]*?\];/;
  if (!re.test(tsSource)) {
    throw new Error('Could not find pluralNumbers block (expected // @cldr-plural-meta …) in NumberParser.ts');
  }
  return tsSource.replace(re, pluralBlock);
}

async function runMaintenance() {
  const latest = await latestReleaseFromDownloads();
  let ts = fs.readFileSync(NUMBER_PARSER, 'utf8');
  const current = readLastCheckedRelease(ts);
  if (current && compareRelease(latest, current) <= 0) {
    console.log(JSON.stringify({action: 'skip', reason: 'no-newer-cldr-release', latest, current}));
    return;
  }

  const {values, chartUrl} = await scrapePluralNumbers('latest');
  const previousValues = parsePluralNumbersFromTs(ts);
  const numbersChanged =
    previousValues === null || !samePluralNumbers(previousValues, values);

  ts = applyNumberParserUpdate(ts, {release: latest, chartUrl, values});
  fs.writeFileSync(NUMBER_PARSER, ts, 'utf8');

  console.log(JSON.stringify({
    action: 'updated',
    latestRelease: latest,
    previousRelease: current,
    chartUrl,
    numbersChanged,
    values,
  }));
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--maintenance')) {
    await runMaintenance();
    return;
  }

  const json = argv.includes('--json');
  const pos = argv.filter((a) => !a.startsWith('--'));
  const charts = pos[0] || process.env.CLDR_CHARTS_VERSION || 'latest';

  const {values, chartUrl} = await scrapePluralNumbers(charts);
  if (json) {
    console.log(JSON.stringify({values, chartUrl, chartsPathSegment: charts}));
  } else {
    console.log(values);
    if (chartUrl) {
      console.error('Source:', chartUrl);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
