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
  Tooltip
} from "@react/experimental-s2";
import NewIcon from '@react/experimental-s2/icons/New';
import {style} from '@react/experimental-s2/style' with { type: 'macro' };
import {TooltipTrigger} from 'react-aria-components';
import React, {useState} from 'react';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import {ReactComponent as Cloud} from './illustrations/Cloud.svg';
import {ReactComponent as DropToUpload} from './illustrations/DropToUpload.svg';


import "@react/experimental-s2/page.css";

function App() {
  return (
    <Home />
  )
}

export function Draggable() {
  let {dragProps} = useDrag({
    getItems() {
      return [{
        'text/plain': 'Drag and dropped'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    }
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'Copy and paste'
      }];
    }
  });

  let ref = React.useRef(null);
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing >
      <div
        className={style({
          color: 'gray-900',
          padding: 8,
          borderColor: 'gray-900',
          borderWidth: 2,
          borderStyle: 'solid',
          fontFamily: 'sans'
        })}
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}>
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}


function Home() {
  let [isOpen, setOpen] = useState(false);
  let [isFilled, setIsFilled] = useState(false);

  return (
    <div className={style({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'start',
        gap: 16
      })}>
      <div className={style({
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
        <Button size="L" variant="secondary" fillStyle="outline">Click me</Button>
        <Button size="XL" variant="accent" fillStyle="outline" isDisabled>Click me</Button>
        <Divider size="M" />
        <ToggleButton size="XS" isEmphasized>Click and press me</ToggleButton>
        <ToggleButton size="XL" isQuiet>Click and press me</ToggleButton>
        <Divider size="L" />
        <TooltipTrigger>
          <ActionButton><span role="img" aria-label="save">💾</span></ActionButton>
          <Tooltip>Save</Tooltip>
        </TooltipTrigger>
        <Divider size="S" />
        <DialogTrigger>
          <Button variant="primary">Open dialog</Button>
          <Dialog>
            {({close}) => (
              <>
                <Image slot="hero" src="https://i.imgur.com/Z7AzH2c.png" alt="" />
                <Heading slot="title">Spectrum 2.0</Heading>
                <Header>The future</Header>
                <Content>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in</p>
                </Content>
                <Footer><Checkbox>Don't show this again</Checkbox></Footer>
                <ButtonGroup>
                  <Button onPress={close} variant="secondary">Cancel</Button>
                  <Button onPress={close} variant="accent">Save</Button>
                </ButtonGroup>
              </>
            )}
          </Dialog>
        </DialogTrigger>
        <Button variant="accent" onPress={() => setOpen(true)}>Open dialog</Button>
        <DialogContainer onDismiss={() => setOpen(false)}>
          {isOpen &&
            <Dialog isDismissable>
              <Heading slot="title">Settings</Heading>
              <Content>
                <Switch>isDisabled</Switch>
                <CheckboxGroup label="options" isDisabled orientation="horizontal">
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
              </Content>
            </Dialog>
          }
        </DialogContainer>
        <Divider size="L" />
        <div className={style({maxWidth: 56})}>
          <TagGroup label="Ice cream flavor" selectionMode="multiple" disabledKeys={new Set(['mint'])}>
            <Tag id="chocolate" textValue="chocolate"><NewIcon /><Text>Chocolate</Text></Tag>
            <Tag id="mint">Mint</Tag>
            <Tag id="strawberry">Strawberry</Tag>
            <Tag id="vanilla">Vanilla</Tag>
          </TagGroup>
        </div>
      </div>
      <Divider size="M" orientation="vertical"/>
      <div className={style({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 8,
          padding: 8
        })}>
        <Form>
          <TextField label="First Name" name="firstName" />
          <TextField label="Last Name" name="firstName" />
          <TextField label="Email" name="email" type="email" description="Enter an email" />
          <CheckboxGroup label="Favorite sports">
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
      <div className={style({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          gap: 8,
          padding: 8
        })}>
        <IllustratedMessage>
          <Illustration>
            <Cloud />
          </Illustration>
          <Heading>
            Adobes Clouds
          </Heading>
          <Content>
            Pick which cloud you wish to use today.</Content>
          <ButtonGroup>
            <Button variant="secondary" >Adobe Document Cloud</Button>
            <Button variant="accent" >Adobe Creative Cloud</Button>
          </ButtonGroup>
        </IllustratedMessage>
        <Divider size="L" />
        <Draggable />
        <DropZone
          styles={style({width: '[320px]', height: '[280px]'})}
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
        <InlineAlert fillStyle="border" variant="informative">
          <Heading>Payment Information</Heading>
          <Content>
            There was an error processing your payment. Please check that your card information is correct, then try again.
          </Content>
        </InlineAlert>
        <InlineAlert fillStyle="subtleFill" variant="positive">
          <Heading>Payment Information</Heading>
          <Content>
            There was an error processing your payment. Please check that your card information is correct, then try again.
          </Content>
        </InlineAlert>
        <InlineAlert fillStyle="boldFill" variant="notice">
          <Heading>Payment Information</Heading>
          <Content>
            There was an error processing your payment. Please check that your card information is correct, then try again.
          </Content>
        </InlineAlert>
        <InlineAlert fillStyle="border" variant="negative">
          <Heading>Payment Information</Heading>
          <Content>
            There was an error processing your payment. Please check that your card information is correct, then try again.
          </Content>
        </InlineAlert>
        <InlineAlert fillStyle="subtleFill" variant="neutral">
          <Heading>Payment Information</Heading>
          <Content>
            There was an error processing your payment. Please check that your card information is correct, then try again.
          </Content>
        </InlineAlert>
      </div>
    </div>
  );
}


export default App
