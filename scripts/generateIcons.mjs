/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import path, {dirname} from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
import {optimize} from 'svgo';
import { transform } from '@svgr/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function writeToFile(filepath, data) {
  let buffer = Buffer.from(data);
  fs.writeFile(filepath, buffer);
}

/**
 * Takes an icon directory and outputs React Spectrum wrapped icons to the output directory.
 * @param iconDir Source directory.
 * @param outputDir Output directory.
 * @param nameRegex A regex to pull out the icon name from the filename.
 * @param template Template for output file, should take a name from the regex.
 */
export function generateIcons(iconDir, outputDir, nameRegex, template) {
  fs.ensureDirSync(outputDir);
  fs.readdir(iconDir, (err, items) => {
    // bad icons have inline style tags and css
    let badIcons = ['S2_Icon_ProjectCreate_20_N.svg', 'S2_Icon_Projects_20_N.svg', 'S2_Icon_ProjectsAddInto_20_N.svg'];
    let ignoreList = ['index.js', 'util.js', ...badIcons];
    // get all icon files
    let iconFiles = items.filter(item => !!item.endsWith('.svg')).filter(item => !ignoreList.includes(item));

    // generate all icon files
    iconFiles.forEach(icon => {
      fs.readFile(path.resolve(iconDir, icon), 'utf8', (err, contents) => {
        let iconFileName = icon.replace('.svg', '');
        let optimized = transform.sync(
          contents,
          {
            jsxRuntime: 'automatic',
            svgoConfig: {
              plugins: [
                {
                  name: "preset-default",
                  params: {
                    overrides: {
                      removeViewBox: false
                      // inlineStyles: { // works, but fails lint, revisit if the three icons are needed?
                      //   onlyMatchedOnce: false,
                      //   removeMatchedSelectors: true
                      // }
                    }
                  },
                  removeAttrs: {
                    attrs: ['id', 'data.*'] // data attribute removal not working
                  }
                }
              ]
            },
            replaceAttrValues: {
              'var(--iconPrimary, #222)': 'var(--iconPrimary, var(--iconPrimaryFallback, #222))'
            },
            typescript: true,
            plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx']
          })
          .replace('export default SvgComponent;', '');
          // will need to use svgr's templating to add ref support if we want that https://github.com/facebook/create-react-app/pull/5457
        let newFile = template(iconFileName, optimized);

        let filepath = `${outputDir}/${iconFileName.replace('S2_Icon_', '').replace(/_\d+\d+_N/, '')}.tsx`;
        writeToFile(filepath, newFile);
      });
    });
  });
}

let exportNameRegex = /exports\.(?<name>.*?) = .*?;/;

function template(iconName, svg) {
  let importName = iconName.replace('S2_Icon_', '').replace(/_\d+\d+_N/, '');
  let iconRename = importName;
  if (/^[0-9]/.test(importName)) {
    iconRename = '_' + importName;
  }
  return (
`
import {IconProps, IconContext, IconContextValue} from '../Icon';
import {SVGProps, useRef} from 'react';
import {useContextProps} from 'react-aria-components';
import {style} from '../../style-macro/spectrum-theme' with {type: 'macro'};
import {mergeStyles} from '../../style-macro/runtime';

${svg.replace('import type { SVGProps } from "react";', '')}

const iconStyles = style({
  '--iconPrimaryFallback': {
    type: 'fill',
    value: 'gray-800'
  }
});

export default function ${iconRename}(props: IconProps) {
  let ref = useRef<SVGElement>(null);
  let ctx;
  [ctx, ref] = useContextProps({slot: props.slot} as IconContextValue, ref, IconContext);
  let {render, css} = ctx;
  let {
    UNSAFE_className,
    UNSAFE_style,
    slot,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    ...otherProps
  } = props;

  if (!ariaHidden) {
    ariaHidden = undefined;
  }

  let propsToPass = {
    ...otherProps,
    focusable: false,
    'aria-label': ariaLabel,
    'aria-hidden': (ariaLabel ? (ariaHidden || undefined) : true),
    role: 'img',
    'data-slot': slot,
    className: (UNSAFE_className ?? '') + ' ' + mergeStyles(iconStyles, css),
    style: UNSAFE_style
  };

  if (render) {
    return render(<SvgComponent {...propsToPass} />);
  }

  return <SvgComponent {...propsToPass} />;
}

`
  );
}

generateIcons(path.dirname(require.resolve('../s2wf-icons/assets/svg/S2_Icon_3D_20_N.svg')), path.join(__dirname, '..', 'src', 'wf-icons'), exportNameRegex, template);

