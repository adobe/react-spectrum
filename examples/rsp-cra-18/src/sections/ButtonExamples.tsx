/* eslint-disable react/style-prop-object */
import { ActionButton, Button, Divider, Flex, LogicButton, ToggleButton} from '@adobe/react-spectrum';

export default function ButtonExamples() {
  return (
    <>
      <h2>Buttons</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <div>
          <ActionButton>Edit</ActionButton>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="negative" style="fill">Negative fill</Button>
          <Button variant="negative" style="outline">Negative outline</Button>
          <LogicButton variant="and">Logic Button</LogicButton>
          <ToggleButton>ToggleButton</ToggleButton>
        </div>
      </Flex>
    </>
  );
}
