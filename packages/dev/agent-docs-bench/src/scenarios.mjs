/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../../../../');

const s2Pkg = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'packages/@react-spectrum/s2/package.json'), 'utf8')
);
const racPkg = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'packages/react-aria-components/package.json'), 'utf8')
);

export const HEAD_VERSIONS = {
  s2: s2Pkg.version,
  rac: racPkg.version
};

/**
 * Representative scenarios covering: - Single & multi-component S2 / RAC implementation lookups -
 * Uncertain discovery ("searchable dropdown") - S2 style macro + token lookup - Pinned historical
 * S2 (@react-spectrum/s2@1.2.0) and pre-s2-docs RAC (react-aria-components@1.4.0) - Divergent
 * multi-snapshot dependencies (S2 1.2.0 + direct RAC HEAD, plus nested older RAC inside S2) -
 * Unverified patch version warning (@react-spectrum/s2@1.2.1 when only 1.2.0 and HEAD exist)
 */
export const SCENARIOS = [
  {
    id: 's2-combobox-async',
    title: 'S2 searchable ComboBox with dynamic items',
    kind: 'known-components',
    workspace: {
      dependencies: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    },
    legacyPages: [{library: 's2', page: 'ComboBox'}],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:ComboBox', 's2:guide/implementation-guidance']}]
    },
    assertions: {
      mustContainSubstrings: ['@react-spectrum/s2/ComboBox', 'ComboBoxItem', 'prefix'],
      mustNotContainProps: [],
      expectedPackages: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    }
  },
  {
    id: 's2-dialog-form',
    title: 'S2 DialogTrigger with Form, TextField, and Button',
    kind: 'multi-component',
    workspace: {
      dependencies: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    },
    legacyPages: [
      {library: 's2', page: 'Dialog'},
      {library: 's2', page: 'Form'},
      {library: 's2', page: 'TextField'},
      {library: 's2', page: 'Button'}
    ],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:Dialog', 's2:Form', 's2:TextField', 's2:Button']}]
    },
    assertions: {
      mustContainSubstrings: [
        '@react-spectrum/s2/Dialog',
        '@react-spectrum/s2/Form',
        '@react-spectrum/s2/TextField',
        '@react-spectrum/s2/Button'
      ],
      mustNotContainProps: [],
      expectedPackages: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    }
  },
  {
    id: 's2-tableview-selection',
    title: 'S2 TableView dynamic collection with row selection',
    kind: 'known-components',
    workspace: {
      dependencies: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    },
    legacyPages: [{library: 's2', page: 'TableView'}],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:TableView']}]
    },
    assertions: {
      mustContainSubstrings: ['@react-spectrum/s2/TableView', 'TableHeader', 'TableBody'],
      mustNotContainProps: [],
      expectedPackages: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    }
  },
  {
    id: 's2-style-macro-conditional',
    title: 'S2 style macro conditional runtime function and spacing/color tokens',
    kind: 'styling',
    workspace: {
      dependencies: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    },
    legacyPages: [{library: 's2', page: 'style-macro'}],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:style-macro', 's2:guide/implementation-guidance']}]
    },
    assertions: {
      mustContainSubstrings: ['@react-spectrum/s2/style', 'backgroundColor'],
      mustNotContainProps: [],
      expectedPackages: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    }
  },
  {
    id: 's2-discovery-searchable-dropdown',
    title: 'Uncertain component choice: searchable single-select dropdown',
    kind: 'discovery',
    workspace: {
      dependencies: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    },
    legacyPages: [
      {library: 's2', page: 'Picker'},
      {library: 's2', page: 'ComboBox'}
    ],
    v2Plan: {
      brand: 's2',
      steps: [
        {command: 'search', query: 'searchable dropdown autocomplete filter options'},
        {command: 'read', ids: ['s2:ComboBox']}
      ]
    },
    assertions: {
      mustContainSubstrings: ['@react-spectrum/s2/ComboBox', 'ComboBoxItem'],
      mustNotContainProps: [],
      expectedPackages: {'@react-spectrum/s2': HEAD_VERSIONS.s2}
    }
  },
  {
    id: 'rac-combobox-custom',
    title: 'React Aria Components ComboBox with render props and Label composition',
    kind: 'known-components',
    workspace: {
      dependencies: {'react-aria-components': HEAD_VERSIONS.rac}
    },
    legacyPages: [{library: 'react-aria', page: 'ComboBox'}],
    v2Plan: {
      brand: 'rac',
      steps: [{command: 'read', ids: ['rac:ComboBox']}]
    },
    assertions: {
      mustContainSubstrings: ['react-aria-components', 'Label', 'ListBoxItem'],
      mustNotContainProps: [],
      expectedPackages: {'react-aria-components': HEAD_VERSIONS.rac}
    }
  },
  {
    id: 'pinned-s2-1.2.0',
    title:
      'Historical pinned workspace: @react-spectrum/s2@1.2.0 (pre-ComboBox.prefix & pre-SideNav)',
    kind: 'historical-pinned',
    workspace: {
      dependencies: {'@react-spectrum/s2': '1.2.0'}
    },
    legacyPages: [{library: 's2', page: 'ComboBox'}],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:ComboBox']}]
    },
    assertions: {
      mustContainSubstrings: ['ComboBox'],
      // In @react-spectrum/s2@1.2.0, ComboBox did NOT have the `prefix` prop!
      mustNotExposePropOnEntry: {entryId: 's2:ComboBox', propName: 'prefix'},
      mustRejectMissingEntry: 's2:SideNav',
      expectedPackages: {'@react-spectrum/s2': '1.2.0'}
    }
  },
  {
    id: 'pinned-rac-1.4.0',
    title:
      'Historical pre-s2-docs workspace: react-aria-components@1.4.0 (pre-Autocomplete & pre-isReadOnly renderProp)',
    kind: 'historical-pinned',
    workspace: {
      dependencies: {'react-aria-components': '1.4.0'}
    },
    legacyPages: [{library: 'react-aria', page: 'ComboBox'}],
    v2Plan: {
      brand: 'rac',
      steps: [{command: 'read', ids: ['rac:ComboBox']}]
    },
    assertions: {
      mustContainSubstrings: ['ComboBox', 'ListBoxItem'],
      // In react-aria-components@1.4.0, ComboBoxProps had no selectionMode multi-select prop (only ListBox had selectionMode)
      mustNotExposePropOnEntry: {
        entryId: 'rac:ComboBox',
        exportName: 'ComboBox',
        propName: 'selectionMode'
      },
      mustRejectMissingEntry: 'rac:Autocomplete',
      expectedPackages: {'react-aria-components': '1.4.0'}
    }
  },
  {
    id: 'mixed-s2-1.2.0-rac-head',
    title:
      'Divergent multi-snapshot workspace: @react-spectrum/s2@1.2.0 + direct react-aria-components@HEAD (nested RAC 1.4.0 inside S2)',
    kind: 'divergent-multi-snapshot',
    workspace: {
      dependencies: {
        '@react-spectrum/s2': '1.2.0',
        'react-aria-components': HEAD_VERSIONS.rac
      },
      nestedDependencies: {
        '@react-spectrum/s2': {
          'react-aria-components': '1.4.0'
        }
      }
    },
    legacyPages: [
      {library: 's2', page: 'ComboBox'},
      {library: 'react-aria', page: 'ComboBox'}
    ],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:ComboBox', 'rac:ComboBox']}]
    },
    assertions: {
      mustContainSubstrings: ['ComboBox'],
      mustNotExposePropOnEntry: {
        entryId: 's2:ComboBox',
        exportName: 'ComboBox',
        propName: 'prefix'
      },
      mustExposePropOnEntry: {
        entryId: 'rac:ComboBox',
        exportName: 'ComboBox',
        propName: 'selectionMode'
      },
      expectedWarningCode: 'WARN_MULTIPLE_PACKAGE_INSTANCES',
      expectedPackages: {
        '@react-spectrum/s2': '1.2.0',
        'react-aria-components': HEAD_VERSIONS.rac
      }
    }
  },
  {
    id: 'unverified-patch-s2-1.2.1',
    title:
      'Unverified patch version: @react-spectrum/s2@1.2.1 when only 1.2.0 and HEAD snapshots exist',
    kind: 'unverified-patch',
    workspace: {
      dependencies: {'@react-spectrum/s2': '1.2.1'}
    },
    legacyPages: [{library: 's2', page: 'ComboBox'}],
    v2Plan: {
      brand: 's2',
      steps: [{command: 'read', ids: ['s2:ComboBox']}]
    },
    assertions: {
      mustContainSubstrings: [],
      expectedWarningOrErrorCode: 'EXACT_PATCH_UNAVAILABLE',
      mustNotSilentlyUseVersion: HEAD_VERSIONS.s2
    }
  }
];
