import React from 'react';
import {Flex} from '../layout';
import {Text} from '../text';
import {View} from '../../primitives';
import {cn} from '../../styles/cn';

export type StatusLightVariant = 'neutral' | 'positive' | 'notice' | 'negative' | 'informative';

export interface StatusLightProps {
  children?: React.ReactNode;
  className?: string;
  variant?: StatusLightVariant;
}

const indicatorClasses: Record<StatusLightVariant, string> = {
  informative: 'bg-informative',
  negative: 'bg-negative',
  neutral: 'bg-textMuted',
  notice: 'bg-notice',
  positive: 'bg-positive'
};

export function StatusLight({children, className, variant = 'neutral'}: StatusLightProps) {
  return (
    <Flex alignItems="center" className={cn('gap-200', className)}>
      <View className={cn('h-200 w-200 rounded-full', indicatorClasses[variant])} />
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text size="S">{children}</Text>
      ) : (
        children
      )}
    </Flex>
  );
}
