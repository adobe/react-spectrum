/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import noPackageRootImportsRule from '../rules/no-package-root-imports.js';
import {RuleTester} from 'eslint';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2015,
    sourceType: 'module'
  }
});

ruleTester.run('no-package-root-imports', noPackageRootImportsRule, {
  valid: [
    {
      code: "import {Button} from 'react-aria-components/Button';"
    },
    {
      code: "import {useButton} from 'react-aria/useButton';"
    },
    {
      code: "import {ListState} from 'react-stately/list';"
    },
    {
      code: "import {Button} from '@react-spectrum/button';"
    }
  ],
  invalid: [
    {
      code: "import {Button} from 'react-aria-components';",
      errors: [
        {
          message:
            "Import from a subpath instead of 'react-aria-components'. For example: 'react-aria-components/Button'."
        }
      ]
    },
    {
      code: "import {useButton, useFocusRing} from 'react-aria';",
      errors: [
        {
          message:
            "Import from a subpath instead of 'react-aria'. For example: 'react-aria/useButton', 'react-aria/useFocusRing'."
        }
      ]
    },
    {
      code: "import {useListState} from 'react-stately';",
      errors: [
        {
          message:
            "Import from a subpath instead of 'react-stately'. For example: 'react-stately/useListState'."
        }
      ]
    },
    {
      code: "import * as RAC from 'react-aria-components';",
      errors: [
        {
          message:
            "Import from a subpath instead of 'react-aria-components'. For example: 'react-aria-components/<subpath>'."
        }
      ]
    }
  ]
});
