/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

// How the runner drives each scenario in scenarios.mjs, keyed by fixture and then by
// the action part of the scenario id (`table.scroll` → drivers.table.actions.scroll).
//
// - fixture.prepare runs after the fixture mounts, for every action except `mount`.
// - action.prepare runs next. Neither is measured.
// - action.spec(size) is armed in the page (see app/measure.ts), so it must be plain
//   data. Its event, target, key, and scroll distance/speed also drive the measured
//   input, unless action.input replaces that input.
// - fixture.verify and action.verify assert the result after the measurement window.
//
// Hooks receive {page, size, action} and, when verifying, the measured sample.

export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

const condition = (selector, rest = {}) => ({selector, ...rest});
const click = (target, conditions) => ({event: 'pointerdown', target, conditions});
const press = (key, target, conditions) => ({event: 'keydown', key, target, conditions});
// A browser-generated wheel scroll of fixed distance and speed. The long, steady scroll
// gives each trial hundreds of frame intervals; completion itself is not the score.
const scrollDistance = 4000;
const deepScrollStart = 4000 * 40;
const scroll = (target, conditions, rest = {}) => ({
  event: 'wheel',
  target,
  frames: true,
  distance: scrollDistance,
  speed: 2000,
  conditions: [condition(target, {scrollTop: scrollDistance - 1}), ...conditions],
  ...rest
});

const records = size => Array.from({length: size}, (_, i) => `item-${i}`);
const recordLabel = id => `Record ${id.slice('item-'.length)}`;
const ordered = (selector, values) =>
  condition(selector, {orderedValues: {attribute: 'data-record', values}});

async function visibleRows(page, selector) {
  return page.locator(`${selector} [data-record]`).evaluateAll(nodes =>
    nodes.map(node => ({
      id: node.getAttribute('data-record'),
      label: node.querySelector('[slot="label"]')?.textContent,
      level: node.getAttribute('aria-level')
    }))
  );
}

function invalidRows() {
  throw new Error('Visible collection records have incorrect labels or hierarchy levels.');
}

// ComboBox and Select popups start open with the first option focused, then move to
// the second option with the keyboard or pointer.
function navigation(fixture) {
  let combobox = fixture === 'combobox';
  let option = id => `[role="option"][data-record="${id}"]`;
  let open = async (page, focusFirst) => {
    await page.locator(combobox ? '#combo-open' : '#select-open').click();
    await page.getByRole('option').last().waitFor();
    await focusFirst();
    await page.locator(`${option('item-0')}[data-focused]`).waitFor();
  };
  let conditions = size => [
    condition('[role="option"]', {count: size}),
    condition('[role="option"][data-focused]', {
      count: 1,
      attribute: 'data-record',
      value: 'item-1'
    }),
    combobox
      ? condition('#combo-input', {focused: true, activeDescendant: option('item-1')})
      : condition(option('item-1'), {focused: true})
  ];
  return {
    keyboard: {
      prepare: ({page}) => open(page, () => page.keyboard.press('Home')),
      spec: size => press('ArrowDown', combobox ? '#combo-input' : '.list', conditions(size))
    },
    hover: {
      prepare: ({page}) => open(page, () => page.locator(option('item-0')).hover()),
      spec: size => ({event: 'pointerover', target: option('item-1'), conditions: conditions(size)})
    }
  };
}

async function waitForTableRows({page}) {
  await page.locator('.data-table [data-record]').last().waitFor();
}

async function prepareDeepScroll({page}) {
  let table = page.locator('[data-bench="records-table"]');
  await page.locator('[data-record="item-0"]').waitFor();
  await table.hover();
  let box = await table.boundingBox();
  let session = await page.context().newCDPSession(page);
  try {
    // Traverse the rows in this mounted instance so layout history accumulates.
    // A direct scrollTop assignment would skip the workload this scenario targets.
    await session.send('Input.synthesizeScrollGesture', {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
      yDistance: -deepScrollStart,
      speed: 40000,
      gestureSourceType: 'mouse',
      preventFling: true
    });
  } finally {
    await session.detach();
  }
  await page.waitForFunction(start => {
    let viewport = document.querySelector('[data-bench="records-table"]');
    return (
      Math.abs(viewport.scrollTop - start) <= 1 &&
      !!viewport.querySelector('[data-record="item-4000"]')
    );
  }, deepScrollStart);
}

async function prepareDndInput({page}, keyboard = false) {
  await page.locator('.draggable-card').last().waitFor();
  await page.locator('#dnd-notes').click();
  if (keyboard) {
    await page.keyboard.press('ArrowLeft');
  }
  await page.waitForFunction(keyboard => {
    let cards = [...document.querySelectorAll('.draggable-card')];
    let expected = keyboard ? 'Press Enter to start dragging.' : 'Click to start dragging.';
    return (
      cards.length > 0 &&
      cards.every(
        card =>
          document.getElementById(card.getAttribute('aria-describedby'))?.textContent === expected
      )
    );
  }, keyboard);
}

const dndInput = () =>
  press('a', '#dnd-notes', [
    condition('#dnd-value', {text: 'a'}),
    condition('#dnd-notes', {focused: true})
  ]);

async function verifyTableRows({page, size, action}) {
  let expected = (action.expected ?? records)(size);
  let rows = await page.locator('.data-table [data-record]').evaluateAll(rows =>
    rows.map(row => ({
      id: row.getAttribute('data-record'),
      name: row.querySelector('[role="rowheader"]')?.textContent
    }))
  );
  if (
    rows.length !== expected.length ||
    rows.some((row, i) => row.id !== expected[i] || row.name !== recordLabel(expected[i]))
  ) {
    throw new Error('The table did not retain the expected row order and content.');
  }
}

const filtered = size => records(size).filter(id => id.includes('9'));
const dataRows = (expected, direction) => [
  ordered('.data-table [data-record]', expected),
  condition('[data-bench="sort-name"]', {attribute: 'aria-sort', value: direction})
];

async function verifyColumns({page, size}, expectedWidth) {
  let widths = await page.locator('.resizable-table th').evaluateAll(columns =>
    columns.map(column => ({
      style: parseFloat(column.style.width),
      actual: column.getBoundingClientRect().width
    }))
  );
  if (
    widths.length !== 6 ||
    widths.some(
      width => width.style !== expectedWidth || Math.abs(width.actual - expectedWidth) > 1
    )
  ) {
    throw new Error('The table columns did not finish resizing to the expected width.');
  }
  await page.getByRole('rowheader', {name: `Record ${size - 1}`, exact: true}).waitFor();
}

const resizedRows = (size, width) => [
  condition('.resizable-table [data-record]', {count: size}),
  condition('.resizable-table th', {count: 6, style: {property: 'width', value: `${width}px`}})
];

const variableLayout = (size, narrow = false, atTop = true) => ({
  viewport: '#variable-list',
  width: narrow ? 360 : 600,
  total: size,
  atTop
});
const variableWidth = width =>
  condition('#variable-list', {style: {property: 'width', value: `${width}px`}});

const measuredTableLayout = (size, labels = 300, name = 150, width = 1000) => ({
  viewport: '.measured-table',
  width,
  total: size,
  atTop: true,
  columns: [name, labels, 90, 90, 90, 90, 90, width - 2 - name - labels - 450]
});
const labelsWidth = width =>
  condition('.measured-table [data-column="labels"]', {
    style: {property: 'width', value: `${width}px`}
  });
async function narrowMeasuredTable({page, size}) {
  await page.locator('#table-narrow').click();
  await page.evaluate(
    expected => window.__bench.settleLayout(expected),
    measuredTableLayout(size, 100)
  );
}

const collectionRows = (expected, selected, final) => [
  ordered('.mutation-list [data-record]', expected),
  condition('.mutation-list [data-record][aria-selected="true"]', {count: selected}),
  final
];

const treeRecords = (size, expanded) => {
  let roots = Array.from({length: 20}, (_, i) => `project-${i}`);
  return expanded
    ? [roots[0], ...Array.from({length: size / 20}, (_, i) => `file-0-${i}`), ...roots.slice(1)]
    : roots;
};
const treeRows = (size, expanded, focused) => [
  ordered('.project-tree [data-record]', treeRecords(size, expanded)),
  condition('.project-tree [data-record="project-0"]', {
    attribute: 'aria-expanded',
    value: String(expanded)
  }),
  condition(`.project-tree [data-record="${focused}"]`, {focused: true})
];
async function expandFirstProject({page}) {
  await page.keyboard.press('ArrowRight');
  await page.locator('.project-tree [data-record="file-0-0"]').waitFor();
}

export const drivers = {
  listbox: {
    actions: {
      mount: {spec: size => click('#mount', [condition('.list [role="option"]', {count: size})])},
      focus: {
        prepare: ({page}) => page.locator('[data-record="item-0"]').focus(),
        spec: () =>
          press('ArrowDown', '.list', [condition('[data-record="item-1"]', {focused: true})])
      },
      select: {
        spec: () =>
          click('[data-record="item-2"]', [
            condition('[data-record="item-2"]', {attribute: 'aria-selected', value: 'true'})
          ])
      },
      parent: {spec: () => click('#parent-update', [condition('#revision', {text: '1'})])}
    }
  },
  combobox: {
    actions: {
      open: {spec: size => click('#combo-open', [condition('[role="option"]', {count: size})])},
      filter: {
        prepare: async ({page}) => {
          await page.locator('#combo-open').click();
          await page.getByRole('option').last().waitFor();
          await page.locator('#combo-input').focus();
        },
        spec: size =>
          press('9', '#combo-input', [
            condition('#query', {text: '99'}),
            condition('[role="option"]', {
              count: Array.from({length: size}, (_, i) => String(i)).filter(i => i.includes('99'))
                .length
            })
          ]),
        // Type 99 with a fixed pause between keys; timing starts at the first keydown.
        input: async page => {
          await page.keyboard.press('9');
          await pause(75);
          await page.keyboard.press('9');
        }
      },
      ...navigation('combobox')
    }
  },
  select: {actions: navigation('select')},
  'table-data': {
    prepare: waitForTableRows,
    verify: verifyTableRows,
    actions: {
      focus: {
        prepare: ({page}) => page.locator('.data-table [data-record="item-0"] td').first().focus(),
        spec: () =>
          press('ArrowDown', '.data-table', [
            condition('.data-table [data-record="item-1"] td:first-of-type', {focused: true}),
            condition('.data-table [aria-selected="true"]', {count: 0})
          ])
      },
      sort: {
        expected: size => records(size).reverse(),
        spec: size =>
          click('[data-bench="sort-name"]', dataRows(records(size).reverse(), 'descending'))
      },
      filter: {
        expected: filtered,
        prepare: ({page}) => page.locator('#table-filter').focus(),
        spec: size => press('9', '#table-filter', dataRows(filtered(size), 'ascending'))
      },
      clear: {
        prepare: async ({page}) => {
          await page.locator('#table-filter').focus();
          await page.keyboard.press('9');
          await page.waitForFunction(() =>
            [...document.querySelectorAll('.data-table [data-record]')].every(row =>
              row.getAttribute('data-record').includes('9')
            )
          );
        },
        spec: size => press('Backspace', '#table-filter', dataRows(records(size), 'ascending'))
      }
    }
  },
  'table-cells': {
    prepare: waitForTableRows,
    verify: verifyTableRows,
    actions: {
      select: {
        spec: () =>
          click('[data-record="item-2"] .react-aria-Checkbox', [
            condition('.data-table [data-record][aria-selected="true"]', {
              count: 1,
              attribute: 'data-record',
              value: 'item-2'
            }),
            condition('[data-record="item-2"] input:checked', {count: 1})
          ])
      },
      'select-all': {
        spec: size =>
          click('.data-table thead .react-aria-Checkbox', [
            condition('.data-table [data-record][aria-selected="true"]', {count: size}),
            condition('.data-table input:checked', {count: size + 1})
          ])
      },
      menu: {
        spec: () =>
          click('#menu-item-2', [
            condition('[role="menuitem"][data-action="edit"]', {focused: true})
          ])
      },
      'menu-close': {
        prepare: async ({page}) => {
          await page.locator('#menu-item-2').click();
          await page.locator('[role="menuitem"][data-action="edit"]').waitFor();
        },
        spec: () =>
          press('Escape', '[role="menu"]', [
            condition('[role="menu"]', {count: 0}),
            condition('#menu-item-2', {focused: true})
          ])
      },
      dialog: {
        spec: () =>
          click('#dialog-item-2', [
            condition('[role="dialog"]'),
            condition('#note-item-2', {focused: true})
          ])
      },
      'dialog-close': {
        prepare: async ({page}) => {
          await page.locator('#dialog-item-2').click();
          await page.locator('#note-item-2').waitFor();
        },
        spec: () =>
          click('#close-item-2', [
            condition('[role="dialog"]', {count: 0}),
            condition('#dialog-item-2', {focused: true})
          ])
      }
    }
  },
  table: {
    verify: async ({page, size}) => {
      let rows = await page.locator('[data-record]').count();
      if (!rows || rows >= size) {
        throw new Error('Expected a populated, virtualized viewport, not all records in the DOM.');
      }
    },
    actions: {
      'scroll-deep': {
        prepare: prepareDeepScroll,
        spec: () =>
          scroll('[data-bench="records-table"]', [], {
            conditions: [
              condition('[data-bench="records-table"]', {
                scrollTop: deepScrollStart + scrollDistance - 1
              }),
              condition('[data-record="item-4100"] [role="rowheader"]', {text: 'Record 4100'})
            ]
          }),
        verify: async ({page}) => {
          let correct = await page.evaluate(expected => {
            let table = document.querySelector('[data-bench="records-table"]');
            let viewport = table.getBoundingClientRect();
            let row = table.querySelector('[data-record="item-4100"]').getBoundingClientRect();
            return (
              Math.abs(table.scrollTop - expected) <= 1 &&
              row.bottom > viewport.top + 40 &&
              row.top < viewport.bottom
            );
          }, deepScrollStart + scrollDistance);
          if (!correct) {
            throw new Error('Deep scrolling did not expose row 4,100 at the expected offset.');
          }
        }
      },
      mount: {
        spec: () =>
          click('#mount', [
            condition('[data-record="item-2"] [role="rowheader"]', {text: 'Record 2'})
          ])
      },
      scroll: {
        prepare: async ({page}) => {
          await page.locator('[data-record="item-0"]').waitFor();
          await page.locator('[data-bench="records-table"]').hover();
        },
        spec: () => scroll('[data-bench="records-table"]', [condition('[data-record="item-100"]')]),
        verify: async ({page}) => {
          let visible = await page.evaluate(() => {
            let viewport = document
              .querySelector('[data-bench="records-table"]')
              .getBoundingClientRect();
            let row = document.querySelector('[data-record="item-100"]').getBoundingClientRect();
            return row.bottom > viewport.top && row.top < viewport.bottom;
          });
          if (!visible) {
            throw new Error('Scroll did not expose the expected row.');
          }
        }
      },
      update: {
        spec: () =>
          click('#edit-record', [
            condition('[data-record="item-2"] [role="rowheader"]', {text: 'Updated record'})
          ])
      }
    }
  },
  'table-measured': {
    prepare: ({page, size}) =>
      page.evaluate(expected => window.__bench.settleLayout(expected), measuredTableLayout(size)),
    verify: async ({page}) => {
      let rows = await page.locator('.measured-table [data-record]').evaluateAll(rows =>
        rows.map(row => ({
          id: row.getAttribute('data-record'),
          name: row.querySelector('[role="rowheader"]').textContent
        }))
      );
      if (rows.some(row => row.name !== recordLabel(row.id))) {
        invalidRows();
      }
    },
    actions: {
      'resize-animation': {
        prepare: narrowMeasuredTable,
        spec: size => ({
          ...click('#table-animate', [
            condition('.measured-table-container', {
              attribute: 'data-resize-animation',
              value: 'done'
            }),
            condition('.measured-table-container', {style: {property: 'width', value: '800px'}})
          ]),
          frames: true,
          layout: measuredTableLayout(size, 100, 150, 800)
        }),
        verify: ({sample}) => {
          let elapsed = sample.frameIntervals.reduce((total, interval) => total + interval, 0);
          if (elapsed < 2800) {
            throw new Error('Frame measurements did not span the three-second resize animation.');
          }
        }
      },
      mount: {
        spec: size => ({...click('#mount', [labelsWidth(300)]), layout: measuredTableLayout(size)})
      },
      narrow: {
        spec: size => ({
          ...click('#table-narrow', [labelsWidth(100)]),
          layout: measuredTableLayout(size, 100)
        })
      },
      widen: {
        prepare: narrowMeasuredTable,
        spec: size => ({
          ...click('#table-widen', [labelsWidth(300)]),
          layout: measuredTableLayout(size)
        })
      },
      'other-column': {
        prepare: narrowMeasuredTable,
        spec: size => ({
          ...click('#table-name-resize', [
            condition('.measured-table [data-column="name"]', {
              style: {property: 'width', value: '170px'}
            })
          ]),
          layout: measuredTableLayout(size, 100, 170)
        })
      },
      container: {
        prepare: narrowMeasuredTable,
        spec: size => ({
          ...click('#table-container-resize', [
            condition('.measured-table-container', {style: {property: 'width', value: '800px'}})
          ]),
          layout: measuredTableLayout(size, 100, 150, 800)
        })
      }
    }
  },
  variable: {
    prepare: ({page, size}) =>
      page.evaluate(expected => window.__bench.settleLayout(expected), variableLayout(size)),
    verify: async ({page}) => {
      let rows = await visibleRows(page, '#variable-list');
      if (rows.some(row => row.label !== recordLabel(row.id))) {
        invalidRows();
      }
    },
    actions: {
      mount: {
        spec: size => ({...click('#mount', [variableWidth(600)]), layout: variableLayout(size)})
      },
      scroll: {
        prepare: ({page}) => page.locator('#variable-list').hover(),
        spec: size => scroll('#variable-list', [], {layout: variableLayout(size, false, false)}),
        verify: ({sample}) => {
          if (
            !sample.layout.rows.some(
              row => row.index > 0 && row.top < sample.layout.height && row.top + row.height > 0
            )
          ) {
            throw new Error('Variable-height scrolling did not traverse records.');
          }
        }
      },
      resize: {
        spec: size => ({
          ...click('#variable-resize', [variableWidth(360)]),
          layout: variableLayout(size, true)
        })
      }
    }
  },
  collection: {
    prepare: async ({page, action}) => {
      let count = action.selected ?? 1;
      for (let i = 0; i < count; i++) {
        await page.locator(`.mutation-list [data-record="item-${i}"] .react-aria-Checkbox`).click();
      }
      await page.waitForFunction(
        count =>
          document.querySelectorAll('.mutation-list [data-record][aria-selected="true"]').length ===
          count,
        count
      );
    },
    verify: async ({page, size, action}) => {
      let labels = await page
        .locator('.mutation-list [data-record] [data-record-label]')
        .allTextContents();
      let expected = action
        .expected(size)
        .map(id =>
          id.startsWith('replacement-')
            ? `New record ${id.slice('replacement-'.length)}`
            : recordLabel(id)
        );
      if (JSON.stringify(labels) !== JSON.stringify(expected)) {
        throw new Error(
          'Collection records did not retain their expected labels after the update.'
        );
      }
    },
    actions: {
      append: {
        expected: size => records(size * 1.5),
        spec: size =>
          click(
            '#collection-append',
            collectionRows(
              records(size * 1.5),
              1,
              condition('.mutation-list [data-record="item-0"]', {
                attribute: 'aria-selected',
                value: 'true'
              })
            )
          )
      },
      remove: {
        selected: 5,
        expected: size => records(size).slice(5),
        prepare: ({page}) => page.locator('.mutation-list [data-record="item-4"]').focus(),
        spec: size =>
          press(
            'Delete',
            '.mutation-list',
            collectionRows(
              records(size).slice(5),
              0,
              condition('.mutation-list [data-record="item-5"]', {focused: true})
            )
          )
      },
      replace: {
        expected: size => records(size).map((_, i) => `replacement-${i}`),
        spec: size =>
          click(
            '#collection-replace',
            collectionRows(
              records(size).map((_, i) => `replacement-${i}`),
              0,
              condition('#collection-replace', {focused: true})
            )
          )
      }
    }
  },
  tree: {
    prepare: ({page}) => page.locator('.project-tree [data-record="project-0"]').focus(),
    verify: async ({page}) => {
      let rows = await visibleRows(page, '.project-tree');
      if (
        rows.some(row => {
          let root = row.id.startsWith('project-');
          let expected = root
            ? `Project ${row.id.slice('project-'.length)}`
            : `File ${row.id.slice('file-'.length)}`;
          return row.label !== expected || row.level !== (root ? '1' : '2');
        })
      ) {
        invalidRows();
      }
    },
    actions: {
      expand: {
        spec: size => press('ArrowRight', '.project-tree', treeRows(size, true, 'project-0'))
      },
      navigate: {
        prepare: expandFirstProject,
        spec: size => press('ArrowDown', '.project-tree', treeRows(size, true, 'file-0-0'))
      },
      collapse: {
        prepare: expandFirstProject,
        spec: size => press('ArrowLeft', '.project-tree', treeRows(size, false, 'project-0'))
      }
    }
  },
  resize: {
    prepare: ({page}) =>
      page.waitForFunction(() => {
        let columns = [...document.querySelectorAll('.resizable-table th')];
        return columns.length === 6 && columns.every(column => column.style.width === '160px');
      }),
    actions: {
      mount: {
        spec: size => click('#mount', resizedRows(size, 160)),
        verify: context => verifyColumns(context, 160)
      },
      container: {
        spec: size => click('#resize-container', resizedRows(size, 110)),
        verify: context => verifyColumns(context, 110)
      }
    }
  },
  dnd: {
    verify: async ({page, size}) => {
      let cards = await page.locator('.draggable-card').evaluateAll(cards =>
        cards.map(card => ({
          id: card.getAttribute('data-record'),
          label: card.querySelector('strong').textContent,
          draggable: card.getAttribute('draggable'),
          dragging: card.hasAttribute('data-dragging'),
          description: document.getElementById(card.getAttribute('aria-describedby'))?.textContent
        }))
      );
      if (
        cards.length !== size ||
        cards.some(
          (card, i) =>
            card.id !== `item-${i}` ||
            card.label !== `Record ${i}` ||
            card.draggable !== 'true' ||
            card.dragging ||
            card.description !== 'Press Enter to start dragging.'
        ) ||
        (await page.locator('#dnd-notes').inputValue()) !== 'a'
      ) {
        throw new Error(
          'Typing did not preserve the draggable cards and their keyboard instructions.'
        );
      }
    },
    actions: {
      'modality-type': {prepare: context => prepareDndInput(context), spec: dndInput},
      type: {prepare: context => prepareDndInput(context, true), spec: dndInput}
    }
  },
  form: {
    actions: {
      mount: {spec: size => click('#mount', [condition('.form-grid > *', {count: size})])},
      type: {
        prepare: ({page}) => page.locator('#project-name').focus(),
        spec: () => press('a', '#project-name', [condition('#project-value', {text: 'a'})])
      },
      dialog: {
        spec: () =>
          click('#dialog-open', [
            condition('#review-note', {focused: true}),
            condition('[role="dialog"]')
          ])
      }
    }
  }
};

export function driver(scenario) {
  let name = scenario.id.slice(scenario.fixture.length + 1);
  let fixture = drivers[scenario.fixture];
  let action = fixture?.actions[name];
  if (!action || scenario.id !== `${scenario.fixture}.${name}`) {
    throw new Error(`Unknown scenario: ${scenario.id}`);
  }
  return {fixture, action, name};
}
