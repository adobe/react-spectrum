import React, {useRef} from 'react';
import {useFocusVisible} from "../src";
import {Button} from "@react-spectrum/button";
import {TextField} from "@react-spectrum/textfield";
import {ComponentMeta, Story} from "@storybook/react";

export default {
  title: 'useFocusVisible',
  argTypes: {}
} as ComponentMeta<typeof FocusVisibleExample>;

export const FocusVisible = {
  render: () => <FocusVisibleExample />
};

function FocusVisibleExample() {
  let firstField = useRef(null);
  let secondField = useRef(null);
  const {isFocusVisible} = useFocusVisible();
  return (
    <div>
      <div role={"article"}>isFocusVisible: {`${isFocusVisible}`}</div>
      <Button variant="primary" onPress={() => firstField.current.focus()}>Focus first</Button>
      <Button variant="primary" onPress={() => secondField.current.focus()}>Focus second</Button>
      <fieldset>
        <legend>React Spectrum Textfield</legend>
        <div tabIndex={-1}>
          <TextField
            ref={firstField}
            label={
              <>
                In tabIndex={'{-1}'}
              </>
            }
            defaultValue="test" />
        </div>
        <div>
          <TextField
            ref={secondField}
            label={
              <>
                Not In tabIndex={'{-1}'}
              </>
            }
            defaultValue="test" />
        </div>
      </fieldset>
    </div>
  );
}
