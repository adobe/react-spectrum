/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  ActionButton,
  ActionMenu,
  Button,
  CardPreview,
  Checkbox,
  CoachMark,
  CoachMarkTrigger,
  Content, Footer, Image, Keyboard, MenuItem,
  Slider,
  Text
} from '../src';
import Filter from '../s2wf-icons/S2_Icon_Filter_20_N.svg';
import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};
import {useState} from 'react';

const meta: Meta<typeof CoachMark> = {
  component: CoachMark,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    placement: {
      control: 'radio',
      options: ['top', 'left', 'left top', 'right', 'right top', 'bottom']
    }
  },
  title: 'CoachMark'
};

export default meta;

export const CoachMarkExample = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button>Before</Button>
      <CoachMarkTrigger defaultOpen>
        <Checkbox>Sync with CC</Checkbox>
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button>After</Button>
    </div>
  )
};

function ControlledCoachMark(args) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button onPress={() => setIsOpen(true)}>Open</Button>
      <CoachMarkTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <Checkbox>Sync with CC</Checkbox>
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button onPress={() => setIsOpen(false)}>Close</Button>
    </div>
  );
}
export const CoachMarkRestartable = {
  render: (args) => (
    <ControlledCoachMark {...args} />
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const CoachMarkSlider = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button>Before</Button>
      <CoachMarkTrigger defaultOpen>
        <Slider label="Horizontal position" labelPosition="top" />
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button>After</Button>
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};

export const CoachMarkButton = {
  render: (args) => (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Button>Before</Button>
      <CoachMarkTrigger defaultOpen>
        <ActionButton>
          <Filter />
        </ActionButton>
        <CoachMark placement="right top" {...args}>
          <CardPreview>
            <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
          </CardPreview>
          <Content>
            <Text slot="title">Hello</Text>
            <ActionMenu>
              <MenuItem>Skip tour</MenuItem>
              <MenuItem>Restart tour</MenuItem>
            </ActionMenu>
            <Keyboard>Command + B</Keyboard>
            <Text slot="description">This is the description</Text>
          </Content>
          <Footer>
            <Text slot="steps">1 of 10</Text>
            <Button fillStyle="outline" variant="secondary">Previous</Button>
            <Button variant="primary">Next</Button>
          </Footer>
        </CoachMark>
      </CoachMarkTrigger>
      <Button>After</Button>
    </div>
  ),
  parameters: {
    docs: {
      disable: true
    }
  }
};
// function MyCoachMark({step, currentStep, totalSteps, description = '', skipTour, restartTour, advanceStep, previousStep, hasPressAction = false, placement = 'right top' as Placement}) {
//   const onAction = actionKey => {
//     if (actionKey === 'skip') {
//       skipTour();
//     } else if (actionKey === 'restart') {
//       restartTour();
//     }
//   };
//   return (
//     <CoachMark placement={placement}>
//       <CardPreview>
//         <Image src={new URL('assets/preview.png', import.meta.url).toString()} />
//       </CardPreview>
//       <Content>
//         <Text slot="title">Coach mark title</Text>
//         <ActionMenu onAction={onAction}>
//           <MenuItem id="skip">Skip tour</MenuItem>
//           {step !== 1 && <MenuItem id="restart">Restart tour</MenuItem>}
//         </ActionMenu>
//         <Keyboard>Command + B</Keyboard>
//         <Text slot="description">{description || 'This is the description'}</Text>
//       </Content>
//       <Footer>
//         <Text slot="steps">{currentStep} of {totalSteps}</Text>
//         {step !== 1 && <Button fillStyle="outline" variant="secondary" onPress={previousStep}>Previous</Button>}
//         {step !== totalSteps && !hasPressAction && <Button autoFocus variant="primary" onPress={advanceStep}>Next</Button>}
//         {step === totalSteps && !hasPressAction && <Button variant="primary" onPress={advanceStep}>Finish</Button>}
//       </Footer>
//     </CoachMark>
//   );
// }

// export const TourExample = () => {
//   let {createCoachMarkTriggerProps, ...otherTourProps} = useTour({defaultComplete: true});
//   return (
//     <div className={style({display: 'flex'})}>
//       <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 16})}>
//         <CoachMarkTrigger {...createCoachMarkTriggerProps(1)}>
//           <ActionButton >
//             <Filter />
//           </ActionButton>
//           <MyCoachMark step={1} {...otherTourProps} description="This is the action button." />
//         </CoachMarkTrigger>

//         <CoachMarkTrigger {...createCoachMarkTriggerProps(3)}>
//           <Slider label="Horizontal position" labelPosition="top" />
//           <MyCoachMark step={3} {...otherTourProps} description="Adjust this slider to change the value." />
//         </CoachMarkTrigger>

//         <CoachMarkTrigger {...createCoachMarkTriggerProps(4)}>
//           <Checkbox>Sync with CC</Checkbox>
//           <MyCoachMark step={4} {...otherTourProps} description="Check this box to sync with Creative Cloud" />
//         </CoachMarkTrigger>
//       </div>
//       <div style={{width: 500}}>
//         <Button onPress={otherTourProps.restartTour}>Start tour</Button>
//       </div>
//       <div className={style({display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'end'})}>
//         <CoachMarkTrigger {...createCoachMarkTriggerProps(2)}>
//           <Button onPress={otherTourProps.advanceStep}>
//             Apply
//           </Button>
//           <MyCoachMark
//             step={2}
//             placement="left top"
//             {...otherTourProps}
//             description="This is the Apply button. Press it to continue the tour."
//             hasPressAction />
//         </CoachMarkTrigger>

//         <CoachMarkTrigger {...createCoachMarkTriggerProps(5)}>
//           <Toolbar orientation="vertical">
//             <ActionButton isQuiet>
//               <TextIcon />
//             </ActionButton>
//             <ActionButton isQuiet>
//               <TextAdd />
//             </ActionButton>
//             <ActionButton isQuiet>
//               <TextBold />
//             </ActionButton>
//           </Toolbar>
//           <MyCoachMark
//             step={5}
//             placement="left top"
//             {...otherTourProps}
//             description="Use this toolbar to adjust text values." />
//         </CoachMarkTrigger>
//       </div>
//     </div>
//   );
// };
