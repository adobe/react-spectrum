'use client';
import React from 'react';
import {
  UNSTABLE_ToastRegion as ToastRegion,
  UNSTABLE_Toast as Toast,
  UNSTABLE_ToastQueue as ToastQueue,
  UNSTABLE_ToastContent as ToastContent,
  ToastProps,
  Button,
  Text
} from 'react-aria-components';
import {XIcon} from 'lucide-react';
import {composeTailwindRenderProps} from './utils';

interface MyToastContent {
  title: string;
  description?: string;
}

export const queue = new ToastQueue<MyToastContent>();

export function MyToastRegion() {
  return (
    <ToastRegion
      queue={queue}
      className="fixed bottom-4 right-4 flex flex-col-reverse gap-2 outline-none focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2">
      {({toast}) => (
        <MyToast toast={toast}>
          <ToastContent className="flex flex-col flex-1 min-w-0">
            <Text slot="title" className="font-semibold text-white">{toast.content.title}</Text>
            {toast.content.description && (
              <Text slot="description" className="text-sm text-white">{toast.content.description}</Text>
            )}
          </ToastContent>
          <Button
            slot="close"
            aria-label="Close"
            className="flex flex-none appearance-none w-8 h-8 rounded-sm bg-transparent border-none text-white p-0 outline-none hover:bg-white/10 pressed:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 items-center justify-center">
            <XIcon className="w-4 h-4" />
          </Button>
        </MyToast>
      )}
    </ToastRegion>
  );
}

export function MyToast(props: ToastProps<MyToastContent>) {
  return (
    <Toast
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "flex items-center gap-4 bg-blue-600 px-4 py-3 rounded-lg outline-none forced-colors:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2"
      )}
    />
  );
}
