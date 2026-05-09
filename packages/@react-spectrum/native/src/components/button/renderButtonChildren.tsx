import React from 'react';
import {ActivityIndicator} from 'react-native';
import {ButtonText} from './ButtonText';

export function renderButtonChildren({
  children,
  isProgressVisible,
  progressColor,
  textClassName
}: {
  children?: React.ReactNode;
  isProgressVisible?: boolean;
  progressColor?: string;
  textClassName?: string;
}) {
  let content =
    typeof children === 'string' || typeof children === 'number' ? (
      <ButtonText className={textClassName}>{children}</ButtonText>
    ) : (
      children
    );

  if (!isProgressVisible) {
    return content;
  }

  return (
    <>
      {content}
      <ActivityIndicator color={progressColor} size="small" />
    </>
  );
}
