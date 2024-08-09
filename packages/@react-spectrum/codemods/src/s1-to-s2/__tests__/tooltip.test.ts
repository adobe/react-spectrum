// @ts-ignore
import {defineSnapshotTest} from 'jscodeshift/dist/testUtils';
import transform from '../src/codemods/codemod';

const test = (name: string, input: string) => {
  defineSnapshotTest(transform, {}, input, name);
};

test('Removes variant', `
import {ActionButton, TooltipTrigger, Tooltip} from '@adobe/react-spectrum';

<div>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip variant="positive">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip variant="info">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip variant="negative">Change Name</Tooltip>
  </TooltipTrigger>
</div>
`);

test('Removes variant in wrapped tooltip', `
import {Tooltip} from '@adobe/react-spectrum';

function MyTooltip(props) {
  return <Tooltip {...props} variant="positive" />;
}
`);

test('moves placement to trigger and replaces with simplified placement', `
import {ActionButton, TooltipTrigger, Tooltip} from '@adobe/react-spectrum';

<div>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="bottom left">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="bottom right">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="bottom start">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="bottom end">Change Name</Tooltip>
  </TooltipTrigger>

  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="top left">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="top right">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="top start">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="top end">Change Name</Tooltip>
  </TooltipTrigger>

  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="left top">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="left bottom">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="start top">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="start bottom">Change Name</Tooltip>
  </TooltipTrigger>

  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="right top">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="right bottom">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="end top">Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip placement="end bottom">Change Name</Tooltip>
  </TooltipTrigger>
</div>
`);

test('Alerts users to placement change in wrapped tooltip', `
import {Tooltip} from '@adobe/react-spectrum';

function MyTooltip(props) {
  return <Tooltip {...props} placement="bottom left" />;
}
`);

test('Removes showIcon', `
import {ActionButton, TooltipTrigger, Tooltip} from '@adobe/react-spectrum';

let showIcon = true;
let props = {showIcon: true};
<div>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip showIcon>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip showIcon={true}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip showIcon={false}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip showIcon={'foo' === 'foo'}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip showIcon={showIcon}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip {...props}>Change Name</Tooltip>
  </TooltipTrigger>
</div>
`);

test('moves isOpen to trigger', `
import {ActionButton, TooltipTrigger, Tooltip} from '@adobe/react-spectrum';

let isOpen = true;
let props = {isOpen: true};
<div>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip isOpen>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip isOpen={true}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip isOpen={false}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip isOpen={'foo' === 'foo'}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip isOpen={isOpen}>Change Name</Tooltip>
  </TooltipTrigger>
  <TooltipTrigger>
    <ActionButton aria-label="Edit Name"><Edit /></ActionButton>
    <Tooltip {...props}>Change Name</Tooltip>
  </TooltipTrigger>
</div>
`);

test('Alerts users to isOpen change in wrapped tooltip', `
import {Tooltip} from '@adobe/react-spectrum';

function MyTooltip(props) {
  return <Tooltip {...props} isOpen />;
}
`);
