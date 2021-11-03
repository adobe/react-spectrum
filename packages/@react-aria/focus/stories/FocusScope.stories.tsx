/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {FocusScope} from '../';
import {Meta, Story} from '@storybook/react';
import React, {ReactNode, useState} from 'react';
import ReactDOM from 'react-dom';

const dialogsRoot = 'dialogsRoot';

interface StoryProps {
  usePortal: boolean
}

const meta: Meta<StoryProps> = {
  title: 'FocusScope',
  component: FocusScope,
  parameters: {
    description: {
      data: 'Should not be able to click or navigate back into inputs from previous "dialogs".'
    }
  }
};

export default meta;

const Template = (): Story<StoryProps> => ({usePortal}) => <Example usePortal={usePortal} />;

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

function Example({usePortal}: StoryProps) {
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

export const KeyboardNavigation = Template().bind({});
KeyboardNavigation.args = {usePortal: false};

export const KeyboardNavigationInsidePortal = Template().bind({});
KeyboardNavigationInsidePortal.args = {usePortal: true};
