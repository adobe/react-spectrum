import React, {forwardRef} from 'react';
import {View as RNView} from 'react-native';
import {Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type BadgeVariant = 'neutral' | 'accent' | 'positive' | 'notice' | 'negative';

export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: BadgeVariant;
}

const badgeClasses: Record<BadgeVariant, string> = {
  accent: 'border-accent bg-accent',
  negative: 'border-negative bg-negative',
  neutral: 'border-border bg-surface',
  notice: 'border-notice bg-notice',
  positive: 'border-positive bg-positive'
};

const textClasses: Record<BadgeVariant, string> = {
  accent: 'text-accentText',
  negative: 'text-white',
  neutral: 'text-text',
  notice: 'text-black',
  positive: 'text-white'
};

export const Badge = forwardRef<React.ElementRef<typeof RNView>, BadgeProps>(
  function Badge(props, ref) {
    let {children, className, variant = 'neutral'} = props;

    return (
      <View
        className={cn(
          'self-start rounded-sm border px-200 py-50',
          badgeClasses[variant],
          className
        )}
        ref={ref}>
        {typeof children === 'string' || typeof children === 'number' ? (
          <Text className={cn('text-75 font-medium', textClasses[variant])}>{children}</Text>
        ) : (
          children
        )}
      </View>
    );
  }
);
