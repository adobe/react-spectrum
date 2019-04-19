import {action} from '@storybook/addon-actions';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import SearchWithin from '../src/SearchWithin';
import {storiesOf} from '@storybook/react';

const defaultProps = {
  placeholder: 'Enter text',
  scopeOptions: [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    'Strawberry',
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream'},
    {label: 'Peppermint', value: 'peppermint'},
    {label: 'Some crazy long value that should be cut off', value: 'longVal'}
  ]
};

const otherProps = {
  scopeOptions: ['All', 'Campaigns', 'Audiences', 'Tags']
};

storiesOf('SearchWithin', module)
  .add('Default', () => render({...otherProps}), {inline: true})
  .add('defaultValue (uncontrolled)', () => render({defaultValue: 'React'}), {
    inline: true
  })
  .add('defaultScope (uncontrolled)', () => render({defaultScope: 'chocolate'}), {
    inline: true
  })
  .add('value (controlled)', () => render({value: 'React', scope: 'vanilla'}), {inline: true})
  .add('disabled: true', () => render({value: 'React', disabled: true}), {inline: true})
  .add('labelled with aria-label', () => render({'aria-label': 'Search', ...otherProps}), {inline: true})
  .add('labelled with FieldLabel and aria-labelledby', () => render({'aria-labelledby': 'search-within-label-id', ...otherProps}), {inline: true});

function render(props = {}) {
  if (props['aria-labelledby']) {
    return (<FieldLabel label="Search" id={props['aria-labelledby']}>
      <SearchWithin onValueChange={action('change')} onSubmit={action('submit')} {...defaultProps} {...props} />
    </FieldLabel>);
  }
  return <SearchWithin onValueChange={action('change')} onSubmit={action('submit')} onScopeChange={action('change')} {...defaultProps} {...props} />;
}
