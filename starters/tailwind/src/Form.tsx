import React from 'react';
import { FormProps, Form as RACForm } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

export function Form(props: FormProps) {
  return <RACForm {...props} className={twMerge('flex flex-col gap-4', props.className)} />;
}
