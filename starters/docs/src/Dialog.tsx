'use client';
import {Dialog as RACDialog, DialogProps, DialogTrigger as RACDialogTrigger, DialogTriggerProps} from 'react-aria-components';
import './Dialog.css';

export function Dialog(props: DialogProps) {
  return <RACDialog {...props} />;
}

export function DialogTrigger(props: DialogTriggerProps) {
  return <RACDialogTrigger {...props} />;
}
