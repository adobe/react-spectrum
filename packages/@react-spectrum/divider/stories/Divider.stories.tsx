import {ActionButton} from '@react-spectrum/button/src';
import {Divider} from '../';
import Properties from '@spectrum-icons/workflow/Properties';
import React from 'react';
import Select from '@spectrum-icons/workflow/Select';
import {storiesOf} from '@storybook/react';

storiesOf('Divider', module)
  .add('Large (Default)',
    () => (
      <section>
        <h1>Large</h1>
        <Divider />
        <p>Page or Section Titles.</p>
      </section>
    )
  )
  .add('Medium',
    () => (
      <section>
        <h1>Medium</h1>
        <Divider size="M" />
        <p>Divide subsections, or divide different groups of elements (between panels, rails, etc.)</p>
      </section>
    )
  )
  .add('Small',
    () => (
      <section>
        <h1>Small</h1>
        <Divider size="S" />
        <p>Divide like-elements (tables, tool groups, elements within a panel, etc.)</p>
      </section>
    )
  )
  .add('Vertical, Large (Default)',
    () => renderVertical(),
  )
  .add('Vertical, Medium',
    () => renderVertical({size: 'M'})
  )
  .add('Vertical, Small',
    () => renderVertical({size: 'S'})
  );

function renderVertical(props = {}) {
  return (
    <section style={{display: 'flex', flexDirection: 'row', height: '32px'}}>
      <ActionButton icon={<Properties />} isQuiet />
      <Divider orientation="vertical" {...props} />
      <ActionButton icon={<Select />} isQuiet />
    </section>
  );
}
