'use client';
import {Card, CardPreview, CardProps, Content, Text} from '@react-spectrum/s2';
import {ReactNode, useEffect, useRef} from 'react';
import {registerSpectrumLink} from './prefetch';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface ComponentCardProps extends Omit<CardProps, 'children'> {
  preview: ReactNode,
  name: string,
  description?: string
}

export function ComponentCardClient(props: ComponentCardProps) {
  let {preview, name, description, href, ...otherProps} = props;
  let ref = useRef(null);
  useEffect(() => {
    // Wait for double collection render.
    let res;
    let frame = requestAnimationFrame(() => {
      res = registerSpectrumLink(ref.current);
    });

    return () => {
      cancelAnimationFrame(frame);
      res?.();
    };
  }, []);

  return (
    <Card {...otherProps} href={href} textValue={name} ref={ref}>
      <CardPreview>
        {preview}
      </CardPreview>
      <Content styles={style({alignContent: 'start'})}>
        <Text slot="title">{name}</Text>
        {description && <Text slot="description">{description}</Text>}
      </Content>
    </Card>
  );
}
