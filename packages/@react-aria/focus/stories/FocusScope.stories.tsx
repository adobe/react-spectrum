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
import {Meta} from '@storybook/react';
import React, {ReactNode, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

const dialogsRoot = 'dialogsRoot';

interface StoryProps {
  isPortaled: boolean,
  contain: boolean
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

const Template = ({isPortaled, contain = true}) => <Example isPortaled={isPortaled} contain={contain} />;

function MaybePortal({children, isPortaled}: {children: ReactNode, isPortaled: boolean}) {
  if (!isPortaled) {
    return <>{children}</>;
  }

  return ReactDOM.createPortal(
    <>{children}</>,
    document.getElementById(dialogsRoot)
  );
}

function NestedDialog({onClose, isPortaled, contain}: {onClose: VoidFunction, isPortaled: boolean, contain: boolean}) {
  let [open, setOpen] = useState(false);
  let [showNew, setShowNew] = useState(false);
  let onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <MaybePortal isPortaled={isPortaled}>
      <FocusScope contain={contain} restoreFocus autoFocus>
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
            {open && <NestedDialog contain={contain} onClose={() => setOpen(false)} isPortaled={isPortaled} />}
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

export function Example({isPortaled, contain}: StoryProps) {
  let [open, setOpen] = useState(false);

  return (
    <div>
      <input />

      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <input />
      {open && <NestedDialog onClose={() => setOpen(false)} isPortaled={isPortaled} contain={contain} />}

      <div id={dialogsRoot} />
    </div>
  );
}

function FocusableFirstInScopeExample() {
  let [contentIndex, setContentIndex] = useState(0);
  let [buttonRemoved, setButtonRemoved] = useState(false);
  function DialogContent(index = 0) {
    const nextIndex = index === 2 ? 0 : index + 1;
    return (
      <>
        <h1 id={`heading-${index}`}>Dialog {index + 1}</h1>
        {index === 2 ?
          (
            <>
              <p>The end of the road.</p>
              <button id={`button-${index}`} key={`button-${index}`} onClick={(e) => {(e.target as Element).remove(); setButtonRemoved(true);}}>Remove Me</button>
              {buttonRemoved &&
                <p>With no tabbable elements within the scope, FocusScope will try to focus the first focusable element within the scope, in this case, the dialog itself.</p>
              }
            </>
          ) :
          (
            <>
              <p>Content that will be replaced by <strong>Dialog {nextIndex + 1}</strong>.</p>
              <button id={`button-${index}`} key={`button-${index}`} onClick={() => setContentIndex(nextIndex)}>Go to Dialog {nextIndex + 1}</button>
            </>
          )
        }

      </>
    );
  }
  const contents = [];
  for (let i = 0; i < 3; i++) {
    contents.push(DialogContent(i));
  }
  return (
    <FocusScope contain>
      <div role="dialog" tabIndex={-1} aria-labelledby={`heading-${contentIndex}`} style={{border: '1px solid currentColor', borderRadius: '5px', padding: '0 1.5rem 1.5rem', width: '15rem'}}>
        {contents[contentIndex]}
      </div>
    </FocusScope>
  );
}

function IgnoreRestoreFocusExample() {
  const [display, setDisplay] = useState(false);
  useEffect(() => {
    let handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDisplay(false);
      }
    };
    document.body.addEventListener('keyup', handleKeyDown);
    return () => {
      document.body.removeEventListener('keyup', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <button type="button" onClick={() => setDisplay(state => !state)}>
        {display ? 'Close dialog 1' : 'Open dialog 1'}
      </button>
      <button type="button" onClick={() => setDisplay(state => !state)}>
        {display ? 'Close dialog 2' : 'Open dialog 2'}
      </button>
      {display &&
        <FocusScope restoreFocus>
          <div role="dialog">
            <input  />
            <input  />
            <input  />
          </div>
        </FocusScope>
      }
    </div>
  );
}

export const KeyboardNavigation = {
  render: Template,
  args: {isPortaled: false}
};

export const KeyboardNavigationInsidePortal = {
  render: Template,
  args: {isPortaled: true}
};

export const KeyboardNavigationNoContain = {
  render: Template,
  args: {isPortaled: false, contain: false}
};

export const KeyboardNavigationInsidePortalNoContain = {
  render: Template,
  args: {isPortaled: true, contain: false}
};

export const IgnoreRestoreFocus = {
  render: () => <IgnoreRestoreFocusExample />
};

export const FocusableFirstInScope = {
  render: () => <FocusableFirstInScopeExample />
};
