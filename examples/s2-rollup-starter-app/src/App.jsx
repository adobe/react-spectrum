import {
  ActionButton,
  Button,
  ButtonGroup,
  Checkbox,
  CheckboxGroup,
  Content,
  Dialog,
  DialogContainer,
  DialogTrigger,
  Divider,
  DropZone,
  Footer,
  Form,
  Header,
  Heading,
  IllustratedMessage,
  Illustration,
  Image,
  InlineAlert,
  Radio,
  RadioGroup,
  SearchField,
  Switch,
  Tag,
  TagGroup,
  Text,
  TextArea,
  TextField,
  ToggleButton,
  Tooltip,
  TooltipTrigger
} from '@react/experimental-s2';
import Cloud from './illustrations/Cloud.svg';
import {Draggable} from './Draggable';
import DropToUpload from './illustrations/dropToUpload.svg';
import NewIcon from '@react/experimental-s2/icons/New';
import React, {useState} from 'react';
import {style} from '@react/experimental-s2/style' with {type: 'macro'};

import '@react/experimental-s2/page.css';

function App() {
  let [isOpen, setOpen] = useState(false);
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <div
        className={style({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        })}>
        <h1
          className={style({
            fontFamily: 'sans',
            fontSize: 'heading-xl',
            fontWeight: 'heading',
            lineHeight: 'heading'
          })}>React Spectrum's Spectrum 2 Rollup example</h1>
      </div>
      <div
        className={style({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'start',
          gap: 16
        })}>
        <div
          className={style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            gap: 8,
            padding: 8
          })}>
          <ActionButton>Press me</ActionButton>
          <ActionButton size="XL" isDisabled>Press me</ActionButton>
          <Divider size="S" />
          <Button>Click me</Button>
          <Button size="S" variant="negative">Click me</Button>
          <Button size="L" variant="secondary" style="outline">Click me</Button>
          <Button size="XL" variant="accent" style="outline" isDisabled>Click me</Button>
          <Divider size="M" />
          <ToggleButton size="XS" isEmphasized>Click and press me</ToggleButton>
          <ToggleButton size="XL" isQuiet>Click and press me</ToggleButton>
          <Divider size="L" />
          <TooltipTrigger>
            <ActionButton><span role="img" aria-label="save">💾</span></ActionButton>
            <Tooltip>Save</Tooltip>
          </TooltipTrigger>
          <Divider size="S" />
          <DialogTrigger type="popover">
            <Button variant="primary">Open Popover</Button>
            <Dialog>
              {({close}) => (
                <>
                  <Heading slot="title">Component settings</Heading>
                  <Divider />
                  <Content>
                    <Form>
                      <Switch>isDisabled</Switch>
                      <CheckboxGroup label="options" orientation="horizontal">
                        <Checkbox value="size">Size</Checkbox>
                        <Checkbox value="staticColor">Static color</Checkbox>
                        <Checkbox value="style">Style</Checkbox>
                        <Checkbox value="variant">Variant</Checkbox>
                      </CheckboxGroup>
                      <RadioGroup label="Size" orientation="horizontal">
                        <Radio value="XS" isDisabled>XS</Radio>
                        <Radio value="S">S</Radio>
                        <Radio value="M">M</Radio>
                        <Radio value="L">L</Radio>
                        <Radio value="XL" isDisabled>XL</Radio>
                      </RadioGroup>
                    </Form>
                  </Content>
                </>
              )}
            </Dialog>
          </DialogTrigger>
          <Button variant="accent" onPress={() => setOpen(true)}>Open dialog</Button>
          <DialogContainer onDismiss={() => setOpen(false)}>
            {isOpen &&
              <Dialog isDismissable>
                <Image slot="hero" src="https://i.imgur.com/Z7AzH2c.png" alt="" />
                <Heading slot="title">Spectrum 2.0</Heading>
                <Header>The future</Header>
                <Content>
                  <p>Introducing Spectrum 2 – a new update to Adobe's design system, for all of Adobe. Designed to support our growing suite of products, Spectrum 2 aims to work seamlessly across experiences by balancing personality and function.</p>
                  <p>The React Spectrum team has been hard at work to bring the Spectrum 2 design to our components. Spectrum 2 in React Spectrum is built on React Aria Components and a new styling foundation powered by Spectrum Tokens, which enable us to rapidly implement design updates. It also brings new features such as t-shirt sizing, improved form layout, dynamic new press interactions, and more.</p>
                </Content>
                <Footer><Checkbox>Don't show this again</Checkbox></Footer>
                <ButtonGroup>
                  <Button onPress={close} variant="secondary">Cancel</Button>
                  <Button onPress={close} variant="accent">Save</Button>
                </ButtonGroup>
              </Dialog>
            }
          </DialogContainer>
          <Divider size="L" />
          <TagGroup css={style({maxWidth: 160})} label="Ice cream flavor" selectionMode="multiple" disabledKeys={new Set(['mint'])}>
            <Tag id="chocolate" textValue="chocolate"><NewIcon /><Text>Chocolate</Text></Tag>
            <Tag id="mint">Mint</Tag>
            <Tag id="strawberry">Strawberry</Tag>
            <Tag id="vanilla">Vanilla</Tag>
          </TagGroup>
        </div>
        <Divider size="M" orientation="vertical"/>
        <div
          className={style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            gap: 8,
            padding: 8
          })}>
          <Form isRequired>
            <TextField label="First Name" name="firstName" />
            <TextField label="Last Name" name="firstName" />
            <TextField label="Email" name="email" type="email" description="Enter an email" />
            <CheckboxGroup label="Favorite sports" isDisabled isRequired={false}>
              <Checkbox value="soccer">Soccer</Checkbox>
              <Checkbox value="baseball">Baseball</Checkbox>
              <Checkbox value="basketball">Basketball</Checkbox>
            </CheckboxGroup>
            <RadioGroup label="Favorite pet">
              <Radio value="cat">Cat</Radio>
              <Radio value="dog">Dog</Radio>
              <Radio value="plant" isDisabled>Plant</Radio>
            </RadioGroup>
            <TextField label="City" name="city" description="A long description to test help text wrapping." />
            <TextField label="A long label to test wrapping behavior" name="long" />
            <SearchField label="Search" name="search" />
            <TextArea label="Comment" name="comment" />
            <Switch>Wi-Fi</Switch>
            <Checkbox>I agree to the terms</Checkbox>
            <div style={{gridColumnStart: 'field'}}>
              <Button type="submit" variant="primary">Submit</Button>
            </div>
          </Form>
        </div>
        <Divider size="M" orientation="vertical"/>
        <div
          className={style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            gap: 8,
            padding: 8
          })}>
          <IllustratedMessage>
            <Illustration>
              <Cloud viewBox="0 0 160 160" />
            </Illustration>
            <Heading>
              Adobe's Clouds
            </Heading>
            <Content>
              Pick which cloud you wish to use today.</Content>
            <ButtonGroup align="center">
              <Button variant="secondary">Adobe Document Cloud</Button>
              <Button variant="secondary">Adobe Creative Cloud</Button>
            </ButtonGroup>
          </IllustratedMessage>
          <Divider size="L" />
          <Draggable />
          <DropZone
            css={style({width: '[320px]', height: '[280px]'})}
            isFilled={isFilled}
            onDrop={() => setIsFilled(true)}>
            <IllustratedMessage>
              <Illustration>
                <DropToUpload />
              </Illustration>
              <Heading>
                Drag and drop your file
              </Heading>
              <Content>
                Or, select a file from your computer
              </Content>
            </IllustratedMessage>
          </DropZone>
          <Divider size="L" />
          <InlineAlert style="border" variant="informative">
            <Heading>Payment Information</Heading>
            <Content>
              There was an error processing your payment. Please check that your card information is correct, then try again.
            </Content>
          </InlineAlert>
          <InlineAlert style="subtleFill" variant="positive">
            <Heading>Payment Information</Heading>
            <Content>
              There was an error processing your payment. Please check that your card information is correct, then try again.
            </Content>
          </InlineAlert>
          <InlineAlert style="boldFill" variant="notice">
            <Heading>Payment Information</Heading>
            <Content>
              There was an error processing your payment. Please check that your card information is correct, then try again.
            </Content>
          </InlineAlert>
          <InlineAlert style="border" variant="negative">
            <Heading>Payment Information</Heading>
            <Content>
              There was an error processing your payment. Please check that your card information is correct, then try again.
            </Content>
          </InlineAlert>
          <InlineAlert style="subtleFill" variant="neutral">
            <Heading>Payment Information</Heading>
            <Content>
              There was an error processing your payment. Please check that your card information is correct, then try again.
            </Content>
          </InlineAlert>
        </div>
      </div>
    </>
   );
}

export default App;
