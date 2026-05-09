import React from 'react';
import {View as RNView} from 'react-native';
import {Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type ColorSwatchSize = 'S' | 'M' | 'L';

export interface ColorSwatchProps {
  color: string;
  size?: ColorSwatchSize;
  isRound?: boolean;
  label?: string;
  className?: string;
  testID?: string;
}

const sizeMap: Record<ColorSwatchSize, number> = {
  S: 20,
  M: 32,
  L: 48
};

export function ColorSwatch({
  color,
  size = 'M',
  isRound = false,
  label,
  className,
  testID
}: ColorSwatchProps) {
  let pixelSize = sizeMap[size];
  let borderRadius = isRound ? pixelSize / 2 : 4;

  return (
    <View className={cn('items-center gap-100', className)} testID={testID}>
      <RNView
        accessibilityLabel={label ?? color}
        accessibilityRole="image"
        style={{
          backgroundColor: color,
          borderRadius,
          height: pixelSize,
          width: pixelSize
        }}
      />
      {label ? <Text className="text-100 text-textMuted">{label}</Text> : null}
    </View>
  );
}
