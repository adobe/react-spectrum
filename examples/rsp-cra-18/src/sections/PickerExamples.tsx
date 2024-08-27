import {Flex, Divider, ComboBox, Item, Picker} from '@adobe/react-spectrum';

export default function PickerExamples() {
  return (
    <>
      <h2>Picker</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <ComboBox label="Favorite Animal">
          <Item key="red panda">Red Panda</Item>
          <Item key="cat">Cat</Item>
          <Item key="dog">Dog</Item>
          <Item key="aardvark">Aardvark</Item>
          <Item key="kangaroo">Kangaroo</Item>
          <Item key="snake">Snake</Item>
        </ComboBox>
        <Picker label="Choose frequency">
          <Item key="rarely">Rarely</Item>
          <Item key="sometimes">Sometimes</Item>
          <Item key="always">Always</Item>
        </Picker>
      </Flex>
    </>
  )
}
