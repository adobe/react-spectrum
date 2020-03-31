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

import {cleanup, render} from '@testing-library/react';
import {Provider} from '@react-spectrum/provider';
import {Radio, RadioGroup} from '../';
import React from 'react';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import userEvent from '@testing-library/user-event';
import V2Radio from '@react/react-spectrum/Radio';
import V2RadioGroup from '@react/react-spectrum/RadioGroup';

let theme = {
  light: themeLight,
  medium: scaleMedium
};

function renderRadioGroup(ComponentGroup, Component, groupProps, radioProps) {
  return render(
    <ComponentGroup {...groupProps}>
      <Component {...radioProps[0]} value="dogs">Dogs</Component>
      <Component {...radioProps[1]} value="cats">Cats</Component>
      <Component {...radioProps[2]} value="dragons">Dragons</Component>
    </ComponentGroup>
  );
}

describe('Radios', function () {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
    cleanup();
  });

  it.each`
    Name         | ComponentGroup  | Component  | groupProps                 | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{onChange: onChangeSpy}} | ${[{}, {}, {}]}
    ${'V2Radio'} | ${V2RadioGroup} | ${V2Radio} | ${{onChange: onChangeSpy}} | ${[{}, {}, {}]}
  `('$Name handles defaults', function ({Name, ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getAllByRole, getByLabelText} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);

    // V2 doesn't have a default generated name
    if (Name === 'Radio') {
      let groupName = radios[0].getAttribute('name');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('name', groupName);
      });
    }

    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');

    let dogs = getByLabelText('Dogs');
    userEvent.click(dogs);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith('dogs');

    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it.each`
    Name         | ComponentGroup  | Component  | groupProps | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{}}      | ${[{}, {}, {}]}
    ${'V2Radio'} | ${V2RadioGroup} | ${V2Radio} | ${{}}      | ${[{}, {}, {}]}
  `('$Name renders without labels', function ({Name, ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getAllByRole} = render(
      <ComponentGroup {...groupProps}>
        <Component {...radioProps[0]} value="dogs" aria-label="dogs" />
        <Component {...radioProps[1]} value="cats" aria-label="cats" />
        <Component {...radioProps[2]} value="dragons" aria-label="dragons" />
      </ComponentGroup>
    );

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);

    // V2 doesn't have a default generated name
    if (Name === 'Radio') {
      let groupName = radios[0].getAttribute('name');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('name', groupName);
      });
    }
  });

  it.each`
    Name         | ComponentGroup  | Component  | groupProps              | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{name: 'customName'}} | ${[{}, {}, {}]}
    ${'V2Radio'} | ${V2RadioGroup} | ${V2Radio} | ${{name: 'customName'}} | ${[{}, {}, {}]}
  `('$Name can be given a group name', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getAllByRole} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radios = getAllByRole('radio');
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('name', groupProps.name);
    });
  });

  // V2 provider can't disable a set of inputs
  it.each`
    Name         | ComponentGroup  | Component  | groupProps | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{}}      | ${[{}, {}, {}]}
  `('$Name can be disabled via the Provider', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getAllByRole} = render(
      <Provider theme={theme} isDisabled>
        <ComponentGroup {...groupProps}>
          <Component {...radioProps[0]} value="dogs">Dogs</Component>
          <Component {...radioProps[1]} value="cats">Cats</Component>
          <Component {...radioProps[2]} value="dragons">Dragons</Component>
        </ComponentGroup>
      </Provider>
    );

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);
    expect(radios[0]).toHaveAttribute('disabled');
    expect(radios[1]).toHaveAttribute('disabled');
    expect(radios[2]).toHaveAttribute('disabled');
  });

  it.each`
    Name         | ComponentGroup  | Component  | groupProps                 | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{onChange: onChangeSpy}} | ${[{}, {isDisabled: true}, {}]}
    ${'V2Radio'} | ${V2RadioGroup} | ${V2Radio} | ${{onChange: onChangeSpy}} | ${[{}, {disabled: true}, {}]}
  `('$Name can have a single disabled radio', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getByLabelText, getAllByRole} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);
    expect(radios[0]).not.toHaveAttribute('disabled');
    expect(radios[1]).toHaveAttribute('disabled');
    expect(radios[2]).not.toHaveAttribute('disabled');

    // have to click label or it won't work
    let dogs = getByLabelText('Dogs');
    let cats = getByLabelText('Cats');
    userEvent.click(cats);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
    userEvent.click(dogs);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith('dogs');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  // V2 can't readonly
  it.each`
    Name         | ComponentGroup  | Component  | groupProps                                   | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{isReadOnly: true, onChange: onChangeSpy}} | ${[{}, {}, {}]}
  `('$Name can be readonly', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getAllByRole, getByLabelText} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);
    expect(radios[0]).toHaveAttribute('readonly');
    expect(radios[1]).toHaveAttribute('readonly');
    expect(radios[2]).toHaveAttribute('readonly');

    let cats = getByLabelText('Cats');
    userEvent.click(cats);
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  // V2 can't readonly
  it.each`
    Name         | ComponentGroup  | Component  | groupProps                 | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{onChange: onChangeSpy}} | ${[{isReadOnly: true}, {}, {}]}
  `('$Name individual radios cannot be readonly', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getAllByRole, getByLabelText} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);
    expect(radios[0]).not.toHaveAttribute('readonly');
    expect(radios[1]).not.toHaveAttribute('readonly');
    expect(radios[2]).not.toHaveAttribute('readonly');

    let dogs = getByLabelText('Dogs');
    userEvent.click(dogs);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
  });

  // once rsp 2.26 comes out, we can re-enable the v2 test
  // ${'V2Radio'} | ${V2RadioGroup} | ${V2Radio} | ${{defaultSelectedValue: 'dragons', onChange: onChangeSpy}} | ${[{}, {}, {}]}
  it.each`
    Name         | ComponentGroup  | Component  | groupProps                                                  | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{defaultValue: 'dragons', onChange: onChangeSpy}}         | ${[{}, {}, {}]}
  `('$Name can have a default value', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getByLabelText, getAllByRole} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');

    // have to click label or it won't work
    let dogs = getByLabelText('Dogs');
    userEvent.click(dogs);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith('dogs');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'false');
  });

  it.each`
    Name         | ComponentGroup  | Component  | groupProps                                           | radioProps
    ${'Radio'}   | ${RadioGroup}   | ${Radio}   | ${{value: 'dragons', onChange: onChangeSpy}}         | ${[{}, {}, {}]}
    ${'V2Radio'} | ${V2RadioGroup} | ${V2Radio} | ${{selectedValue: 'dragons', onChange: onChangeSpy}} | ${[{}, {}, {}]}
  `('$Name can be controlled', function ({ComponentGroup, Component, groupProps, radioProps}) {
    let {getByRole, getByLabelText, getAllByRole} = renderRadioGroup(ComponentGroup, Component, groupProps, radioProps);

    let radioGroup = getByRole('radiogroup');
    let radios = getAllByRole('radio');
    expect(radioGroup).toBeTruthy();
    expect(radios.length).toBe(3);
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');

    let dogs = getByLabelText('Dogs');
    userEvent.click(dogs);
    expect(onChangeSpy).toHaveBeenCalledTimes(1);
    expect(onChangeSpy).toHaveBeenCalledWith('dogs');
    expect(radios[0]).toHaveAttribute('aria-checked', 'false');
    expect(radios[1]).toHaveAttribute('aria-checked', 'false');
    expect(radios[2]).toHaveAttribute('aria-checked', 'true');
  });

  // don't need to test keyboard interactions, the above tests ensure that all the right things are in place
  // for the browser to handle it for us

  it('v3 RadioGroup supports labeling', () => {
    let {getByRole} = renderRadioGroup(RadioGroup, Radio, {label: 'Favorite Pet'}, {});
    let radioGroup = getByRole('radiogroup');

    let labelId = radioGroup.getAttribute('aria-labelledby');
    expect(labelId).toBeDefined();
    let label = document.getElementById(labelId);
    expect(label).toHaveTextContent('Favorite Pet');
  });

  describe('V3 Radio group supports roving tabIndex ', function () {
    it('v3 RadioGroup deafult roving tabIndex', async () => {
      let {getAllByRole} = renderRadioGroup(RadioGroup, Radio, {}, {});
      let radios = getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('tabIndex', '0');
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
      expect(radios[2]).toHaveAttribute('tabIndex', '0');

      radios[0].focus();
      expect(document.activeElement).toBe(radios[0]);

      userEvent.click(radios[1]);
      expect(document.activeElement).toBe(radios[1]);
      expect(radios[0]).toHaveAttribute('tabIndex', '-1');
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
      expect(radios[2]).toHaveAttribute('tabIndex', '-1');
    });

    it('v3 RadioGroup roving tabIndex for autoFocus', async () => {
      let {getAllByRole} = renderRadioGroup(RadioGroup, Radio, {}, [{}, {autoFocus: true}, {}]);
      let radios = getAllByRole('radio');
      expect(radios[0]).toHaveAttribute('tabIndex', '-1');
      expect(radios[1]).toHaveAttribute('tabIndex', '0');
      expect(radios[2]).toHaveAttribute('tabIndex', '-1');
    });
  });
});
