import {Form as RACForm, FormProps} from 'react-aria-components';
import React from 'react';

export function Form(props: FormProps) {
  return <RACForm {...props} className="flex flex-col gap-4" />;
}
