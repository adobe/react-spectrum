import Progress from '../src/Progress';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Progress', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'value: 50',
    () => render({value: 50})
  )
  .add(
    'value: 100',
    () => render({value: 100})
  )
  .add(
    'size: S',
    () => render({size: 'S', value: 50})
  )
  .add(
    'showPercent: true',
    () => render({showPercent: true, value: 50})
  )
  .add(
    'variant: positive',
    () => render({variant: 'positive', value: 50})
  )
  .add(
    'variant: warning',
    () => render({variant: 'warning', value: 50})
  )
  .add(
    'variant: critical',
    () => render({variant: 'critical', value: 50})
  )
  .add(
    'label: React',
    () => render({label: 'React', value: 50})
  )
  .add(
    'labelPosition: left',
    () => render({label: 'React', showPercent: true, labelPosition: 'left', value: 50})
  )
  .add(
    'labelPosition: top',
    () => render({label: 'React', showPercent: true, labelPosition: 'top', value: 50})
  )
  .add(
    'variant: overBackground',
    () => {
      const style = {
        'width': '250px',
        'height': '60px',
        'background-color': 'rgba(0,0,0,0.4)',
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'center'
      };

      return (
        <div style={style}>
          {render({variant: 'overBackground', value: 50})}
        </div>
      );
    }
  );

function render(props = {}) {
  return (
    <Progress {...props} />
  );
}
