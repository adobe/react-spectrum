import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { withKnobs, text, boolean, select } from '@kadira/storybook-addon-knobs';
import { VerticalCenter } from '../.storybook/layout';

import Autocomplete from '../src/Autocomplete';

const defaultProps = {
  placeholder: 'Enter Text...',
  options: [
    { label: 'Chocolate', value: 'chocolate' },
    { label: 'Vanilla', value: 'vanilla' },
    { label: 'Strawberry', value: 'strawberry' },
    { label: 'Caramel', value: 'caramel' },
    { label: 'Cookies and Cream', value: 'cookiescream' },
    { label: 'Peppermint', value: 'peppermint' },
    { label: 'Some crazy long value that should be cut off', value: 'logVal' }
  ]
};

const icons = {
  '': 'None',
  abc: 'ABC',
  actions: 'Actions',
  add: 'Add',
  addCircle: 'AddCircle',
  adjust: 'Adjust',
  adobe: 'Adobe',
  adobeAnalytics: 'AdobeAnalytics',
  adobeAudienceManager: 'AdobeAudienceManager',
  adobeCampaign: 'AdobeCampaign',
  adobeConnect: 'AdobeConnect',
  adobeDocumentCloud: 'AdobeDocumentCloud',
  adobeExperienceManager: 'AdobeExperienceManager',
  adobeMarketingCloud: 'AdobeMarketingCloud',
  adobeMediaOptimizer: 'AdobeMediaOptimizer',
  adobePrimetime: 'AdobePrimetime',
  adobeSendNow: 'AdobeSendNow',
  adobeSocial: 'AdobeSocial',
  adobeTarget: 'AdobeTarget',
  alert: 'Alert',
  alertAdd: 'AlertAdd',
  alertCheck: 'AlertCheck'
};

class AutocompleteWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.initialValue
    };
  }

  render() {
    const { value } = this.state;
    return (
      <Autocomplete
        value={ value }
        label="React"
        onChange={ (v) => { this.setState({ value: v }); action('change')(v); } }
        onBlur={ action('blur') }
        onClose={ action('close') }
        onFocus={ action('focus') }
        onInputChange={ action('inputChange') }
        onOpen={ action('open') }
        onValueClick={ action('valueClick') }
        allowCreate={ boolean('Allow Create', false) }
        disabled={ boolean('Disabled', false) }
        multiple={ boolean('Multiple', false) }
        invalid={ boolean('Invalid', false) }
        icon={ select('Icon', icons, '') }
        { ...defaultProps }
        { ...this.props }
        placeholder={ text('Placeholder', 'Enter Text...') }
      />
    );
  }
}

const selectedValue = [
  'chocolate',
  'vanilla',
  'logVal'
];

storiesOf('Autocomplete', module)
  .addDecorator(withKnobs)
  .addDecorator(story => (
    <VerticalCenter style={ { textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none' } }>
      { story() }
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({ ...defaultProps }),
    { inline: true }
  )
  .addWithInfo(
    'icon: filter',
    () => render({ icon: 'filter' }),
    { inline: true }
  )
  .addWithInfo(
    'placeholder: other placeholder',
    () => render({ placeholder: 'other placeholder' }),
    { inline: true }
  )
  .addWithInfo(
    'multiple: true',
    () => render({ multiple: true, value: selectedValue }),
    { inline: true }
  )
  .addWithInfo(
    'required: true',
    () => render({ required: true }),
    { inline: true }
  )
  .addWithInfo(
    'invalid: true',
    () => render({ invalid: true }),
    { inline: true }
  )
  .addWithInfo(
    'disabled: true',
    () => render({ disabled: true }),
    { inline: true }
  )
  .addWithInfo(
    'multiple disabled: true',
    () => render({ disabled: true, multiple: true, value: selectedValue }),
    { inline: true }
  )
  .addWithInfo(
    'value: longVal, icon: true',
    () => render({ value: 'logVal', icon: 'filter' }),
    { inline: true }
  )
  .addWithInfo(
    'value: longVal',
    () => render({ value: 'logVal' }),
    { inline: true }
  )
  .addWithInfo(
    'no results',
    () => render({ options: [], noResultsText: 'Nothing to see here folks' }),
    { inline: true }
  )
  .addWithInfo(
    'allowCreate: true',
    () => render({ allowCreate: true }),
    { inline: true }
  )
  .addWithInfo(
    'Stateful component',
    () => (
      <AutocompleteWrapper
        initialValue="chocolate"
      />
    ),
    { inline: true, propTables: false, source: false }
  );

function render(props = {}) {
  return (
    <Autocomplete
      label="React"
      onChange={ action('change') }
      onBlur={ action('blur') }
      onClose={ action('close') }
      onFocus={ action('focus') }
      onInputChange={ action('inputChange') }
      onOpen={ action('open') }
      onValueClick={ action('valueClick') }
      { ...defaultProps }
      { ...props }
    />
  );
}
