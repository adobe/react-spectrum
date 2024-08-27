import {Flex, Divider, Form, ComboBox, Item, Button, TextField, RadioGroup, Radio, CheckboxGroup, Checkbox, NumberField, RangeSlider, SearchField, Slider, Switch, TextArea} from '@adobe/react-spectrum';

export default function FormExamples() {
  return (
    <>
      <h2>Forms</h2>
      <Flex direction="column" gap="size-125">
        <Divider />
        <Form maxWidth="size-3600">
          <ComboBox label="Favorite Animal">
            <Item key="red panda">Red Panda</Item>
            <Item key="cat">Cat</Item>
            <Item key="dog">Dog</Item>
            <Item key="aardvark">Aardvark</Item>
            <Item key="kangaroo">Kangaroo</Item>
            <Item key="snake">Snake</Item>
          </ComboBox>
          <TextField label="First Name" />
          <TextField label="Last Name" />
          <RadioGroup label="Favorite pet">
            <Radio value="dogs">Dogs</Radio>
            <Radio value="cats">Cats</Radio>
            <Radio value="dragons">Dragons</Radio>
          </RadioGroup>
          <CheckboxGroup label="Favorite sports">
            <Checkbox value="soccer">Soccer</Checkbox>
            <Checkbox value="baseball">Baseball</Checkbox>
            <Checkbox value="basketball">Basketball</Checkbox>
          </CheckboxGroup>
          <NumberField label="Width" defaultValue={1024} minValue={0} />
          <RangeSlider label="Range" defaultValue={{ start: 12, end: 36 }} />
          <SearchField
            label="Search" />
          <Slider label="Cookies to buy" defaultValue={12} />
          <Switch>Low power mode</Switch>
          <TextArea label="Description" />
          <Button variant="cta">Click Me</Button>
        </Form>
      </Flex>
    </>
  )
}
