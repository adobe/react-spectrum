import {Button, TextArea} from '@adobe/react-spectrum';
import React from 'react';

export function Form() {
  return (
    <>
      <Button variant="cta">Save</Button>
      <TextArea isQuiet />
    </>
  );
}
