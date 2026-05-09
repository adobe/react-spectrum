import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {Flex} from '../layout';
import {Text} from '../text';
import {View} from '../../primitives';
import {cn} from '../../styles/cn';

export type InlineAlertVariant = 'neutral' | 'info' | 'positive' | 'notice' | 'negative';

export interface InlineAlertProps {
  children?: React.ReactNode;
  className?: string;
  heading?: React.ReactNode;
  variant?: InlineAlertVariant;
}

const containerClasses: Record<InlineAlertVariant, string> = {
  info: 'border-informative',
  negative: 'border-negative',
  neutral: 'border-border',
  notice: 'border-notice',
  positive: 'border-positive'
};

const indicatorClasses: Record<InlineAlertVariant, string> = {
  info: 'bg-informative',
  negative: 'bg-negative',
  neutral: 'bg-textMuted',
  notice: 'bg-notice',
  positive: 'bg-positive'
};

export const InlineAlert = forwardRef<React.ElementRef<typeof RNView>, InlineAlertProps>(
  function InlineAlert({children, className, heading, variant = 'neutral'}, ref) {
    return (
      <View
        accessibilityRole="alert"
        className={cn('rounded-md border bg-surface p-400', containerClasses[variant], className)}
        ref={ref}>
        <Flex alignItems="flex-start" className="gap-300">
          <View className={cn('mt-100 h-200 w-200 rounded-full', indicatorClasses[variant])} />
          <View className="flex-1">
            {heading ? (
              typeof heading === 'string' || typeof heading === 'number' ? (
                <Text className="font-semibold" size="M">
                  {heading}
                </Text>
              ) : (
                heading
              )
            ) : null}
            {typeof children === 'string' || typeof children === 'number' ? (
              <Text className={heading ? 'mt-100' : undefined} size="S" variant="detail">
                {children}
              </Text>
            ) : (
              children
            )}
          </View>
        </Flex>
      </View>
    );
  }
);
