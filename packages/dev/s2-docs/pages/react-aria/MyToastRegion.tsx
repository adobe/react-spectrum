'use client';
import React from 'react';
import {UNSTABLE_ToastRegion as ToastRegion, UNSTABLE_Toast as Toast, UNSTABLE_ToastQueue as ToastQueue, UNSTABLE_ToastContent as ToastContent, Button, Text} from 'react-aria-components';

// Define the type for your toast content.
interface MyToastContent {
  title: string,
  description?: string
}

export function MyToastRegion({queue}: {queue: ToastQueue<MyToastContent>}) {
  return (
    <ToastRegion queue={queue}>
      {({toast}) => (
        <Toast toast={toast}>
          <ToastContent>
            <Text slot="title">{toast.content.title}</Text>
            <Text slot="description">{toast.content.description}</Text>
          </ToastContent>
          <Button slot="close">x</Button>
        </Toast>
      )}
    </ToastRegion>
  );
}