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

import {FocusScope, FocusScopeProps} from '../../src/focus/FocusScope';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {JSX, ReactNode, useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

const dialogsRoot = 'dialogsRoot';

interface StoryProps {
  isPortaled: boolean;
  contain: boolean;
}

const meta = {
  title: 'FocusScope',
  parameters: {
    description: {
      data: 'Should not be able to click or navigate back into inputs from previous "dialogs".'
    }
  },
  excludeStories: ['Example']
} as Meta<typeof Example>;

export default meta;

export type FocusScopeStory = StoryFn<typeof Example>;
export type FocusScopeStoryObj = StoryObj<typeof Example>;

function MaybePortal({children, isPortaled}: {children: ReactNode; isPortaled: boolean}) {
  if (!isPortaled) {
    return <>{children}</>;
  }

  return ReactDOM.createPortal(<>{children}</>, document.getElementById(dialogsRoot)!);
}

function NestedDialog({
  onClose,
  isPortaled,
  contain
}: {
  onClose: VoidFunction;
  isPortaled: boolean;
  contain: boolean;
}) {
  let [open, setOpen] = useState(false);
  let [showNew, setShowNew] = useState(false);
  let onKeyDown = e => {
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
            {open && (
              <NestedDialog
                contain={contain}
                onClose={() => setOpen(false)}
                isPortaled={isPortaled}
              />
            )}
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

export let Example = ({isPortaled, contain}: FocusScopeProps & StoryProps): JSX.Element => {
  let [open, setOpen] = useState(false);

  return (
    <div>
      <input aria-label="input before" />
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <input aria-label="input after" />
      {open && (
        <NestedDialog onClose={() => setOpen(false)} isPortaled={isPortaled} contain={contain} />
      )}

      <div id={dialogsRoot} />
    </div>
  );
};

export let ExampleStory: FocusScopeStory = args => <Example {...args} />;
ExampleStory.storyName = 'Example';

function FocusableFirstInScopeExample() {
  let [contentIndex, setContentIndex] = useState(0);
  let [buttonRemoved, setButtonRemoved] = useState(false);
  function DialogContent(index = 0) {
    const nextIndex = index === 2 ? 0 : index + 1;
    return (
      <>
        <h1 id={`heading-${index}`}>Dialog {index + 1}</h1>
        {index === 2 ? (
          <>
            <p>The end of the road.</p>
            <button
              id={`button-${index}`}
              key={`button-${index}`}
              onClick={e => {
                (e.target as Element).remove();
                setButtonRemoved(true);
              }}>
              Remove Me
            </button>
            {buttonRemoved && (
              <p>
                With no tabbable elements within the scope, FocusScope will try to focus the first
                focusable element within the scope, in this case, the dialog itself.
              </p>
            )}
          </>
        ) : (
          <>
            <p>
              Content that will be replaced by <strong>Dialog {nextIndex + 1}</strong>.
            </p>
            <button
              id={`button-${index}`}
              key={`button-${index}`}
              onClick={() => setContentIndex(nextIndex)}>
              Go to Dialog {nextIndex + 1}
            </button>
          </>
        )}
      </>
    );
  }
  const contents: JSX.Element[] = [];
  for (let i = 0; i < 3; i++) {
    contents.push(DialogContent(i));
  }
  return (
    <FocusScope contain>
      <div
        role="dialog"
        tabIndex={-1}
        aria-labelledby={`heading-${contentIndex}`}
        style={{
          border: '1px solid currentColor',
          borderRadius: '5px',
          padding: '0 1.5rem 1.5rem',
          width: '15rem'
        }}>
        {contents[contentIndex]}
      </div>
    </FocusScope>
  );
}

function IgnoreRestoreFocusExample() {
  const [display, setDisplay] = useState(false);
  useEffect(() => {
    let handleKeyDown = e => {
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
      {display && (
        <FocusScope restoreFocus>
          <div role="dialog">
            <input />
            <input />
            <input />
          </div>
        </FocusScope>
      )}
    </div>
  );
}

export const KeyboardNavigation: FocusScopeStoryObj = {
  render: args => <Example {...args} />,
  args: {isPortaled: false}
};

export const KeyboardNavigationInsidePortal: FocusScopeStoryObj = {
  render: args => <Example {...args} />,
  args: {isPortaled: true}
};

export const KeyboardNavigationNoContain: FocusScopeStoryObj = {
  render: args => <Example {...args} />,
  args: {isPortaled: false, contain: false}
};

export const KeyboardNavigationInsidePortalNoContain: FocusScopeStoryObj = {
  render: args => <Example {...args} />,
  args: {isPortaled: true, contain: false}
};

export const IgnoreRestoreFocus: FocusScopeStoryObj = {
  render: () => <IgnoreRestoreFocusExample />
};

export const FocusableFirstInScope: FocusScopeStoryObj = {
  render: () => <FocusableFirstInScopeExample />
};

function FocusableInputFormExample(args) {
  let [isOpen, setOpen] = React.useState(false);
  let {contain, restoreFocus, autoFocus} = args;

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {isOpen && (
        <>
          <div style={{display: 'flex', flexDirection: 'column', marginBottom: '10px'}}>
            <FocusScope contain={contain} restoreFocus={restoreFocus} autoFocus={autoFocus}>
              <label htmlFor="first-input">First Input</label>
              <input id="first-input" />
              <label htmlFor="second-input">Second Input</label>
              <input id="second-input" />
            </FocusScope>
          </div>
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <label htmlFor="third-input">Third Input</label>
            <input id="third-input" />
          </div>
          <button onClick={() => setOpen(false)}>Close</button>
        </>
      )}
    </>
  );
}

export const FocusableInputForm: FocusScopeStoryObj = {
  name: 'FocusableInputForm',
  render: args => <FocusableInputFormExample {...args} />,
  args: {
    contain: true,
    restoreFocus: true,
    autoFocus: true
  },
  argTypes: {
    contain: {
      control: 'boolean'
    },
    restoreFocus: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    }
  },
  parameters: {
    description: {
      data: `
1. Open OS keyboard settings
2. Add Chinese Pinyin - Simplified
3. Go to the third input
4. Type "ni", a set of suggestions should appear
5. Press Tab 3x and see how it shows different suggestions
6. Go to the first input
7. Repeat steps 4&5
8. See how it leaves the suggestions and jumps to the form button
`
    }
  }
};

export let ContainsHiddenElement: FocusScopeStoryObj = {
  render: args => (
    <FocusScope {...args}>
      <input />
      <input style={{visibility: 'hidden'}} />
      <input />
    </FocusScope>
  ),
  args: {
    contain: true
  },
  argTypes: {
    contain: {
      control: 'boolean'
    },
    restoreFocus: {
      control: 'boolean'
    },
    autoFocus: {
      control: 'boolean'
    }
  },
  parameters: {
    description: {
      data: `
Should be able to tab navigate from the first input to the last input.
`
    }
  }
};

export function ContainsAfterExitingSibling() {
  let [isMenuOpen, setMenuOpen] = useState(false);
  let [isDateOpen, setDateOpen] = useState(false);

  let chooseDate = () => {
    setDateOpen(true);
    setTimeout(() => setMenuOpen(false), 350);
  };

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Open menu", then "Choose date and time"</li>
        <li>Wait for the menu to fade out, focus is on "September"</li>
        <li>Press Shift+Tab, focus should wrap to "Next month" and stay in the date picker</li>
      </ol>
      <FocusScope contain restoreFocus>
        <fieldset>
          <legend>Dialog</legend>
          <button onClick={() => setMenuOpen(true)}>Open menu</button>
        </fieldset>
        {isMenuOpen &&
          ReactDOM.createPortal(
            <FocusScope contain={!isDateOpen} restoreFocus autoFocus>
              <fieldset style={{opacity: isDateOpen ? 0 : 1, transition: 'opacity 300ms'}}>
                <legend>Menu</legend>
                <button onClick={chooseDate}>Choose date and time</button>
              </fieldset>
            </FocusScope>,
            document.getElementById(dialogsRoot)!
          )}
        {isDateOpen &&
          ReactDOM.createPortal(
            <FocusScope contain restoreFocus autoFocus>
              <fieldset>
                <legend>Date picker</legend>
                <button>September</button> <button>2026</button> <button>Next month</button>
              </fieldset>
            </FocusScope>,
            document.getElementById(dialogsRoot)!
          )}
      </FocusScope>
      <div id={dialogsRoot} />
    </div>
  );
}

export function ContainsAfterRemovingFocusedElement() {
  let [isShown, setShown] = useState(true);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>In Firefox or Safari, click "Remove me" and press Enter</li>
        <li>Click "Outside", focus should move back to "First"</li>
      </ol>
      <input aria-label="Outside" placeholder="Outside" />
      <FocusScope contain>
        <fieldset>
          <legend>Dialog</legend>
          <input aria-label="First" placeholder="First" />{' '}
          {isShown && (
            <input
              aria-label="Remove me"
              placeholder="Remove me"
              onKeyDown={e => e.key === 'Enter' && setShown(false)}
            />
          )}
        </fieldset>
      </FocusScope>
    </div>
  );
}

export function ContainsWithoutFocusLoop() {
  let [isShown, setShown] = useState(false);

  return (
    <div>
      <p style={{background: 'lightyellow', color: 'black', padding: 8}}>
        <strong>Warning:</strong> without the fix, step 2 freezes the tab in Chrome and throws
        recursion errors in Firefox and Safari.
      </p>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Show popover", focus moves to "First"</li>
        <li>Click the dialog input, focus should stay there</li>
      </ol>
      <button onClick={() => setShown(true)}>Show popover</button>
      <FocusScope contain>
        <fieldset>
          <legend>Dialog</legend>
          <input aria-label="Dialog input" placeholder="Dialog input" />
        </fieldset>
      </FocusScope>
      {isShown && (
        <FocusScope autoFocus>
          <fieldset>
            <legend>Popover</legend>
            <button>First</button>
          </fieldset>
          {ReactDOM.createPortal(
            <FocusScope contain>
              <fieldset>
                <legend>Nested</legend>
                <button>Nested</button>
              </fieldset>
            </FocusScope>,
            document.getElementById(dialogsRoot)!
          )}
        </FocusScope>
      )}
      <div id={dialogsRoot} />
    </div>
  );
}

export function ContainsModalFromDialog() {
  let [isModalOpen, setModalOpen] = useState(false);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Open modal", focus moves to "Modal input"</li>
        <li>Click "Inner", focus should move back to "Modal input"</li>
      </ol>
      <FocusScope contain>
        <fieldset>
          <legend>Dialog</legend>
          <button onClick={() => setModalOpen(true)}>Open modal</button>{' '}
          <FocusScope>
            <input aria-label="Inner" placeholder="Inner" />
          </FocusScope>
        </fieldset>
        {isModalOpen &&
          ReactDOM.createPortal(
            <FocusScope contain autoFocus>
              <fieldset>
                <legend>Modal</legend>
                <input aria-label="Modal input" placeholder="Modal input" />
              </fieldset>
            </FocusScope>,
            document.getElementById(dialogsRoot)!
          )}
      </FocusScope>
      <div id={dialogsRoot} />
    </div>
  );
}

export function ContainsAfterLeavingEveryScope() {
  let [isNestedOpen, setNestedOpen] = useState(true);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>In Firefox or Safari, click "Nested" and press Enter</li>
        <li>Click "Outside", focus should move to "First"</li>
      </ol>
      <input aria-label="Outside" placeholder="Outside" />
      <FocusScope>
        <fieldset>
          <legend>Plain scope</legend>
        </fieldset>
      </FocusScope>
      <FocusScope contain>
        <fieldset>
          <legend>Dialog</legend>
          <input aria-label="First" placeholder="First" />{' '}
          {isNestedOpen && (
            <FocusScope contain autoFocus>
              <input
                aria-label="Nested"
                placeholder="Nested"
                onKeyDown={e => e.key === 'Enter' && setNestedOpen(false)}
              />
            </FocusScope>
          )}
        </fieldset>
      </FocusScope>
    </div>
  );
}

export function TabIntoNestedScope() {
  let [isNestedOpen, setNestedOpen] = useState(false);

  return (
    <div>
      <ol style={{padding: 0, listStylePosition: 'inside'}}>
        <li>Press "Show nested"</li>
        <li>Press Tab, focus should move to "First" in the nested scope</li>
      </ol>
      <FocusScope contain>
        <fieldset>
          <legend>Dialog</legend>
          <button onClick={() => setNestedOpen(true)}>Show nested</button>
          {isNestedOpen && (
            <FocusScope contain>
              <fieldset>
                <legend>Nested</legend>
                <button>First</button> <button>Second</button>
              </fieldset>
            </FocusScope>
          )}
        </fieldset>
      </FocusScope>
    </div>
  );
}
