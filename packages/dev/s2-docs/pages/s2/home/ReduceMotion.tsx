'use client';
import {useEffect, useRef, useState} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {UNSAFE_PortalProvider} from 'react-aria';
import {ToastContainer, Button, ToastQueue, Switch} from '@react-spectrum/s2';

export function ReduceMotion() {
  let ref = useRef(null);
  let [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion)').matches) {
      setReduceMotion(true);
    }
  }, []);

  return (
    <UNSAFE_PortalProvider getContainer={() => ref.current}>
      <ToastContainer
        // @ts-ignore
        PRIVATE_forceReducedMotion={reduceMotion} />
      <div
        ref={ref}
        className={style({
          transform: 'translate(0)',
          height: 300,
          overflow: 'clip',
          backgroundColor: 'layer-2',
          boxShadow: 'elevated',
          borderRadius: {
            default: 'none',
            sm: 'lg'
          },
          padding: 32,
          display: 'flex',
          flexDirection: {
            default: 'column',
            sm: 'row'
          },
          alignItems: {
            default: 'center',
            sm: 'baseline'
          },
          justifyContent: {
            default: 'start',
            sm: 'center'
          },
          gap: 16,
          boxSizing: 'border-box',
          margin: {
            default: -16,
            sm: 0
          },
          marginTop: 0
        })}>
        <Button
          size="L"
          onPress={() => ToastQueue.positive('Toast complete!')}
          variant="secondary">
          Show toast
        </Button>
        <Switch
          size="XL"
          isSelected={reduceMotion}
          onChange={setReduceMotion}>
          Reduce motion
        </Switch>
      </div>
    </UNSAFE_PortalProvider>
  );
}
