import type {Meta} from '@storybook/react';
import {Button, ButtonGroup, DropZone, FileTrigger, Illustration, IllustratedMessage, Heading, Content} from '../src';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import React, {useState} from 'react';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import DropToUpload from '../spectrum-illustrations/dropToUpload.svg';
import Cloud from '../spectrum-illustrations/Cloud.svg';

const meta: Meta<typeof DropZone> = {
  component: DropZone,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;

export const Example = (args: any) => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone 
        {...args}
        className={style({width: '[320px]', height: '[280px]'})}
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
    </>
  );
};

export const ExampleWithFileTrigger = (args: any) => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone 
        {...args}
        className={style({width: '[380px]', height: '[280px]'})}
        isFilled={isFilled}
        onDrop={() => setIsFilled(true)}>
        <IllustratedMessage>
          <Illustration>
            <Cloud />
          </Illustration>
          <Heading>
            Drag and drop your file
          </Heading>
          <Content>
            Or, select a file from your computer
          </Content>
          <ButtonGroup>
            <FileTrigger
              onSelect={() => setIsFilled(true)}>
              <Button variant="accent" >Browse files</Button>
            </FileTrigger>
          </ButtonGroup>
        </IllustratedMessage> 
      </DropZone>
    </>
  );
};

export const LongBanner = (args: any) => {
  let [isFilled, setIsFilled] = useState(false);

  return (
    <>
      <Draggable />
      <DropZone 
        {...args}
        replaceMessage="A really long message that will show the text wrapping hopefully"
        className={style({width: '[320px]', height: '[280px]'})}
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
    </>
  );
};


function Draggable() {
  let {dragProps} = useDrag({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    },
    getAllowedDropOperations() {
      return ['copy'];
    }
  });

  let {clipboardProps} = useClipboard({
    getItems() {
      return [{
        'text/plain': 'hello world'
      }];
    }
  });

  let ref = React.useRef(null);
  let {buttonProps} = useButton({elementType: 'div'}, ref);

  return (
    <FocusRing >
      <div
        className={style({color: 'gray-900'})}
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}>
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}
