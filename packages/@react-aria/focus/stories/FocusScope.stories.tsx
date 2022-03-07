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

import {DOMRefValue} from '@react-types/shared';
import {FocusScope} from '../';
import {Meta, Story} from '@storybook/react';
import React, {ReactNode, RefObject, useRef, useState} from 'react';
import ReactDOM from 'react-dom';

const dialogsRoot = 'dialogsRoot';

interface StoryProps {
  usePortal: boolean,
  contain: boolean,
  useRestoreFocusRef: boolean
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

const Template = (): Story<StoryProps> => ({usePortal, contain = true, useRestoreFocusRef}) => <Example usePortal={usePortal} contain={contain} useRestoreFocusRef={useRestoreFocusRef} />;

function MaybePortal({children, usePortal}: { children: ReactNode, usePortal: boolean}) {
  if (!usePortal) {
    return <>{children}</>;
  }

  return ReactDOM.createPortal(
    <>{children}</>,
    document.getElementById(dialogsRoot)
  );
}

function NestedDialog({onClose, usePortal, contain, restoreFocus = true}: {onClose: VoidFunction, usePortal: boolean, contain: boolean, restoreFocus?: boolean | RefObject<DOMRefValue<HTMLElement>> | RefObject<HTMLElement>}) {
  let [open, setOpen] = useState(false);
  let [showNew, setShowNew] = useState(false);
  let onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <MaybePortal usePortal={usePortal}>
      <FocusScope contain={contain} restoreFocus={restoreFocus} autoFocus>
        {!showNew && (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <div role="dialog" onKeyDown={onKeyDown}>
            <input />
            <input />
            <input />
            <button onClick={() => setShowNew(true)}>replace focusscope children</button>
            <button type="button" onClick={() => setOpen(true)}>
              Open dialog
            </button>
            <button type="button" onClick={onClose}>
              close
            </button>
            {open && <NestedDialog contain={contain} restoreFocus={restoreFocus} onClose={() => setOpen(false)} usePortal={usePortal} />}
          </div>
        )}
        {showNew && (
          // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
          <div role="dialog" onKeyDown={onKeyDown}>
            <input />
            <input autoFocus />
            <input />
          </div>
        )}
      </FocusScope>
    </MaybePortal>
  );
}

function Example({usePortal, contain, useRestoreFocusRef = false}: StoryProps) {
  let [open, setOpen] = useState(false);
  let restoreFocusRef = useRef(null);

  return (
    <div>
      <input  />

      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>

      {useRestoreFocusRef ? <input ref={restoreFocusRef} placeholder="Restore focus here!" /> : <input />}

      {open && <NestedDialog onClose={() => setOpen(false)} usePortal={usePortal} contain={contain} restoreFocus={useRestoreFocusRef ? restoreFocusRef : true} />}

      <div id={dialogsRoot} />
    </div>
  );
}

export const KeyboardNavigation = Template().bind({});
KeyboardNavigation.args = {usePortal: false};

export const KeyboardNavigationInsidePortal = Template().bind({});
KeyboardNavigationInsidePortal.args = {usePortal: true};

export const KeyboardNavigationNoContain = Template().bind({});
KeyboardNavigationNoContain.args = {usePortal: false, contain: false};

export const KeyboardNavigationInsidePortalNoContain = Template().bind({});
KeyboardNavigationInsidePortalNoContain.args = {usePortal: true, contain: false};

export const RestoreFocusRef = Template().bind({});
RestoreFocusRef.args = {usePortal: false, useRestoreFocusRef: true};

export const RestoreFocusRefInsidePortal = Template().bind({});
RestoreFocusRefInsidePortal.args = {usePortal: true, useRestoreFocusRef: true};

function AdditionalRestoreFocusRefExample() {
  let [open, setOpen] = useState(false);
  let [showRestoreFocusElement, setShowRestoreFocusElement] = useState(true);
  let restoreFocusRef = useRef(null);
  let onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div>
      <div>
        <button type="button" onClick={() => setOpen(true)}>
          Open dialog
        </button>
        {showRestoreFocusElement && <input ref={restoreFocusRef} placeholder="Restore focus here!" />}
      </div>
      {open &&
        (
          <FocusScope contain restoreFocus={showRestoreFocusElement ? restoreFocusRef : true} autoFocus>
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div role="dialog" onKeyDown={onKeyDown}>
              <label>
                <input
                  type="checkbox"
                  autoFocus
                  checked={showRestoreFocusElement}
                  onChange={e => setShowRestoreFocusElement(e.target.checked)} />
                Show restore focus element
              </label>
              <button type="button" onClick={() => setOpen(false)}>
                Close dialog
              </button>
            </div>
          </FocusScope>
        )
      }
    </div>
  );
}

const AdditionalRestoreFocusRefExampleTemplate = (): Story<StoryProps> => () => <AdditionalRestoreFocusRefExample />;
export const AdditionalRestoreFocusRef = AdditionalRestoreFocusRefExampleTemplate().bind({});
