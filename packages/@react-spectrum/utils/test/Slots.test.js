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

import React, {useRef} from 'react';
import {render} from '@testing-library/react';
import {SlotProvider, useSlotProps} from '../';
import {triggerPress} from '@react-spectrum/test-utils';
import {useId, useSlotId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';


describe('Slots', function () {
  let results = {};

  afterEach(() => {
    results = {};
  });

  function Component(props) {
    results = useSlotProps(props, 'slotname');
    props = results;
    let ref = useRef();
    let {pressProps} = usePress({onPress: props.onPress, ref});
    return <button id={props.id} {...pressProps} ref={ref}>push me</button>;
  }

  it('sets props', function () {
    let slots = {
      slotname: {UNSAFE_className: 'foo', isDisabled: true, isQuiet: true}
    };
    render(
      <SlotProvider slots={slots}>
        <Component />
      </SlotProvider>
    );
    expect(results).toMatchObject({
      UNSAFE_className: 'foo',
      isDisabled: true,
      isQuiet: true
    });
  });

  it('overrides local props', function () {
    let slots = {
      slotname: {UNSAFE_className: 'foo', isDisabled: false, isQuiet: false, label: null}
    };
    render(
      <SlotProvider slots={slots}>
        <Component UNSAFE_className="bar" isDisabled isQuiet label="boop" />
      </SlotProvider>
    );
    expect(results).toMatchObject({
      UNSAFE_className: expect.stringMatching(/(foo bar|bar foo)/),
      isDisabled: false,
      isQuiet: false,
      label: null
    });
  });

  it('undefined does not override local props', function () {
    let slots = {
      slotname: {label: undefined}
    };
    render(
      <SlotProvider slots={slots}>
        <Component label="boop" />
      </SlotProvider>
    );
    expect(results).toMatchObject({
      label: 'boop'
    });
  });

  it('chains functions', function () {
    let onPress = jest.fn();
    let onPressUser = jest.fn();
    let slots = {
      slotname: {onPress}
    };
    let {getByRole} = render(
      <SlotProvider slots={slots}>
        <Component label="boop" onPress={onPressUser} />
      </SlotProvider>
    );
    triggerPress(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPressUser).toHaveBeenCalledTimes(1);
  });

  it('lets users set their own id', function () {
    let slots = {
      slotname: {id: 'foo'}
    };
    render(
      <SlotProvider slots={slots}>
        <Component label="boop" id="bar" />
      </SlotProvider>
    );
    expect(results).toMatchObject({id: 'bar'});
  });

  it('lets users set their own id when used in conjunction with useId', function () {
    function SlotsUseId(props) {
      let id = useId(props.id);
      return (
        <SlotProvider slots={{slotname: {...props.slots, id}}}>
          <Component id="bar" />
        </SlotProvider>
      );
    }
    render(<SlotsUseId id="foo" />);
    expect(results).toMatchObject({id: 'bar'}); // we've merged with the user provided id
  });

  it('lets users set their own id when used in conjunction with useSlotId', function () {
    function SlotsUseSlotId() {
      let id = useSlotId();
      return (
        <SlotProvider slots={{slotname: {id}}}>
          <Component id="bar" />
        </SlotProvider>
      );
    }
    render(<SlotsUseSlotId />);
    expect(results).toMatchObject({id: 'bar'}); // we've merged with the user provided id
  });
});
