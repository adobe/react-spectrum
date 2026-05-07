import { TextArea } from '@adobe/react-spectrum';
import { Button } from "@react-spectrum/s2";
import React from 'react';

export function Form() {
  return (<>
    <Button variant="accent">Save</Button>
    <TextArea isQuiet />
  </>);
}
