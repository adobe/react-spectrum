'use client';
import {Dialog as RACDialog, DialogProps} from 'react-aria-components';
import './Dialog.css';

export function Dialog(props: DialogProps) {
  return <RACDialog {...props} />;
}
