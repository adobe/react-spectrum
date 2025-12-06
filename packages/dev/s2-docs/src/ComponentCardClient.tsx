'use client';
import {Card, CardPreview, CardProps, Content, Text} from '@react-spectrum/s2';
import {ReactNode} from 'react';
import {registerSpectrumLink} from './prefetch';

interface ComponentCardProps extends Omit<CardProps, 'children'> {
  preview: ReactNode,
  name: string,
  description?: string
}

export function ComponentCardClient(props: ComponentCardProps) {
  let {preview, name, description, ...otherProps} = props;
  return (
    <Card {...otherProps} textValue={name} ref={registerSpectrumLink as any}>
      <CardPreview>
        {preview}
      </CardPreview>
      <Content>
        <Text slot="title">{name}</Text>
        {description && <Text slot="description">{description}</Text>}
      </Content>
    </Card>
  );
}
