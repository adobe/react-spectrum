import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import {AlertDialog, Dialog, DialogTrigger} from '../';
import {Content, Footer, Header} from '@react-spectrum/view';
import CrossLarge from '@spectrum-icons/ui/CrossLarge';
import {Divider} from '@react-spectrum/divider';
import {Image} from '@react-spectrum/image';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';

storiesOf('Dialog', module)
// DialogTrigger isn't affected by color scheme, so only visual test light, and ensure animations work properly.
  .addParameters({chromaticProvider: {colorSchemes: ['light']}, chromatic: {pauseAnimationAtEnd: true}})
  .add(
    'default',
    () => render({})
  )
  .add(
  'isDismissable',
  () => render({isDismissable: true})
  )
  .add(
    'with hero',
    () => renderHero({})
  )
  .add(
    'with hero, isDimissable',
    () => renderHero({isDismissable: true})
  );

storiesOf('Dialog/Alert', module)
// DialogTrigger isn't affected by color scheme, so only visual test light, and ensure animations work properly.
  .addParameters({chromaticProvider: {colorSchemes: ['light']}, chromatic: {pauseAnimationAtEnd: true}})
  .add(
    'destructive',
    () => renderAlert({
      variant: 'destructive',
      title: 'Warning Destructive',
      children: (<Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text>),
      primaryLabel: 'Accept',
      cancelLabel: 'Cancel',
      onConfirm: action('confirm'),
      onCancel: action('cancel')
    })
  )
  .add(
    'confirmation',
    () => renderAlert({
      variant: 'confirmation',
      title: 'Confirmation Required',
      children: (<Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text>),
      primaryLabel: 'Accept',
      cancelLabel: 'Cancel',
      onConfirm: action('confirm'),
      onCancel: action('cancel')
    })
  )
  .add(
    'information',
    () => renderAlert({
      variant: 'information',
      title: 'Informative Alert',
      children: (<Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text>),
      primaryLabel: 'Accept',
      cancelLabel: 'Cancel',
      onConfirm: action('confirm'),
      onCancel: action('cancel')
    })
  )
  .add(
    'error',
    () => renderAlert({
      variant: 'error',
      title: 'Error: Danger Will Robinson',
      children: (<Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text>),
      primaryLabel: 'Accept',
      cancelLabel: 'Cancel',
      onConfirm: action('confirm'),
      onCancel: action('cancel')
    })
  );

function render({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        <Dialog {...props}>
          <Header><Text slot="title">The Title</Text></Header>
          <Divider size="M" />
          <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
          <Footer><Button variant="secondary">Cancel</Button><Button variant="cta">Confirm</Button></Footer>
          <ActionButton slot="closeButton" isQuiet icon={<CrossLarge size="L" />} />
        </Dialog>
      </DialogTrigger>
    </div>
  );
}


function renderHero({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        <Dialog {...props}>
          <Image slot="hero" src="https://git.corp.adobe.com/pages/rsnow/assets/photos/25percent/IMG_0721.png" objectFit="cover" />
          <Header><Text slot="title">The Title</Text></Header>
          <Divider size="M" />
          <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
          <Footer><Button variant="secondary">Cancel</Button><Button variant="cta">Confirm</Button></Footer>
          <ActionButton slot="closeButton" isQuiet icon={<CrossLarge size="L" />} />
        </Dialog>
      </DialogTrigger>
    </div>
  );
}


function renderAlert({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        <AlertDialog {...props} />
      </DialogTrigger>
    </div>
  );
}
