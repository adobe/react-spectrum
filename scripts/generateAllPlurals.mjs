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

/* Scrapes data on CLDR https://www.unicode.org/cldr/charts/44/supplemental/language_plural_rules.html#comparison
 * and generates a list of all possible values needed between all locales for plural rules.
 * It is used by our NumberParser to generate all literal strings, ex units 1 foot, 2 feet, but other locales have more than 2 forms.
 */
import {JSDOM} from 'jsdom';

function getRange(row) {
  let range = [];

  let th = row.firstElementChild;

  do {
    const { textContent } = th;

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

fetch('https://www.unicode.org/cldr/charts/44/supplemental/language_plural_rules.html#comparison')
  .then(async (response) => {
    let data = await response.text();
    const dom = new JSDOM(data);

    const [integerTable, fractionTable] = dom.window.document.querySelectorAll('.pluralComp');

    let values = extractTable(dom, integerTable, fractionTable);
    console.log(values);
  });
