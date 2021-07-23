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

import {boolean, withKnobs} from '@storybook/addon-knobs';
import {FocusScope} from '../';
import React, {ReactNode, useState} from 'react';
import ReactDOM from 'react-dom';
import {storiesOf} from '@storybook/react';

const dialogsRoot = 'dialogsRoot';

storiesOf('FocusScope', module)
  .addDecorator(withKnobs)
  .add(
    'keyboard navigation with nested FocusScope',
    () => <KeyboardNavigation usePortal={boolean('Use Portal', false)} />
  );

function MaybePortal({children, usePortal}: { children: ReactNode, usePortal: boolean}) {
  if (!usePortal) {
    return <>{children}</>;
  }

  return ReactDOM.createPortal(
    <>{children}</>,
    document.getElementById(dialogsRoot)
  );
}

function NestedDialog({onClose, usePortal}: {onClose: VoidFunction, usePortal: boolean}) {
  let [open, setOpen] = useState(false);

  return (
    <MaybePortal usePortal={usePortal}>
      <FocusScope contain restoreFocus autoFocus>
        <div>
          <input />

          <input />

          <input />

          <button type="button" onClick={() => setOpen(true)}>
            Open dialog
          </button>

          <button type="button" onClick={onClose}>
            close
          </button>

          {open && <NestedDialog onClose={() => setOpen(false)} usePortal={usePortal} />}
        </div>
      </FocusScope>
    </MaybePortal>
  );
}

function KeyboardNavigation({usePortal}: {usePortal: boolean}) {
  let [open, setOpen] = useState(false);

  return (
    <div>
      <input />

      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>

      {open && <NestedDialog onClose={() => setOpen(false)} usePortal={usePortal} />}

      <div id={dialogsRoot} />
    </div>
  );
}
