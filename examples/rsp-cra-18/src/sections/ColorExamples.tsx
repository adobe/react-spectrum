import {ColorArea, ColorField, ColorSlider, ColorWheel, Flex, Divider} from '@adobe/react-spectrum';

export default function ColorExamples() {
  return (
    <>
      <h2>Color</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <ColorArea defaultValue="#7f0000" />
        <ColorField label="Primary Color" />
        <ColorSlider defaultValue="#7f0000" channel="red" />
        <ColorWheel defaultValue="hsl(30, 100%, 50%)" />
      </Flex>
    </>
  )
}
