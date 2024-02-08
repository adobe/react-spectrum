import type {Meta} from '@storybook/react';
import {DropZone} from '../src/DropZone';
import {FileTrigger} from 'react-aria-components';
import {FocusRing, mergeProps, useButton, useClipboard, useDrag} from 'react-aria';
import {IllustratedMessage} from '../src/IllustratedMessage';
import React, {useState} from 'react';
import {style} from '../style-macro/spectrum-theme' with { type: 'macro' };
import {Button} from '../src/Button';
import DropToUpload from '../spectrum-illustrations/dropToUpload.svg';
import Cloud from '../spectrum-illustrations/Cloud.svg';
import {Illustration} from '../src/Illustration';
import {Heading, Content} from '../src/Content';

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
        className={style({width: '[320px]', height: '[280px]'})()}
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
        className={style({width: '[380px]', height: '[280px]'})()}
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
          {/* TODO: Swap out with ButtonGroup */}
          <div className={style({display: 'flex', gridArea: 'buttonGroup', alignSelf: 'start', gap: 2, marginTop: 4})()} >
            <FileTrigger
              onSelect={() => setIsFilled(true)}>
              <Button variant="accent" >Browse files</Button>
            </FileTrigger>
          </div>
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
        className={style({width: '[320px]', height: '[280px]'})()}
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
        className={style({color: 'gray-900'})()}
        ref={ref}
        {...mergeProps(dragProps, buttonProps, clipboardProps)}>
        <span>Drag me</span>
      </div>
    </FocusRing>
  );
}
