'use client';
import React from 'react';
import {type DialogProps, Dialog as RACDialog, Heading} from 'react-aria-components/Dialog';
import {twMerge} from 'tailwind-merge';

export function Dialog(props: DialogProps) {
  return (
    <RACDialog
      {...props}
      className={twMerge(
        'outline outline-0 box-border p-6 [[data-placement]>&]:p-4 max-h-[inherit] overflow-auto relative',
        props.className
      )}
    />
  );
}

export {Heading};
