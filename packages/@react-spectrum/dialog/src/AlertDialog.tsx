import React from 'react';
import {SpectrumDialogProps} from '@react-types/dialog';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Text} from '@react-spectrum/typography';
import {Divider} from '@react-spectrum/divider';
import {Button} from '@react-spectrum/button';
import {Dialog} from './Dialog';
import AlertMedium from '@spectrum-icons/ui/AlertMedium';

export function AlertDialog(props: SpectrumDialogProps) {
  return (
    <Dialog UNSAFE_className="spectrum-Dialog--error">
      <Header><Text slot="title">{props.title}</Text><AlertMedium slot="typeIcon" aria-label="alert" /></Header>
      <Divider size="M" />
      <Content>{props.content}</Content>
      <Footer><Button variant="secondary" onPress={props.onCancel}>Cancel</Button><Button variant="negative" onPress={props.onConfirm}>Accept</Button></Footer>
    </Dialog>
  );
}
