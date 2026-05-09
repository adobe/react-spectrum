import React from 'react';
import {Image} from 'react-native';
import {Text, View} from '../../primitives';
import {cn} from '../../styles/cn';

export type AvatarSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  testID?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  XS: 24,
  S: 32,
  M: 40,
  L: 48,
  XL: 64
};

// A fixed palette of semantic background colors for initials avatars.
// Derived deterministically from the name so the same name always
// yields the same color across renders.
const INITIALS_COLORS = [
  '#2D6A9F', // informative blue
  '#287D3C', // positive green
  '#B83C3C', // negative red
  '#8249BC', // purple
  '#CB6C22', // notice orange
  '#1A7A8A', // teal
  '#5C4B8A', // violet
  '#2E6B5E'  // forest
];

function getInitialsColor(name: string | undefined): string {
  if (!name) {
    return INITIALS_COLORS[0];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return INITIALS_COLORS[hash % INITIALS_COLORS.length];
}

function getInitials(name: string | undefined): string {
  if (!name) {
    return '?';
  }
  let parts = name.trim().split(/\s+/);
  return parts[0][0].toUpperCase();
}

export function Avatar({src, name, size = 'M', className, testID}: AvatarProps) {
  let pixelSize = sizeMap[size];
  let borderRadius = pixelSize / 2;
  let fontSize = Math.round(pixelSize * 0.4);

  if (src) {
    return (
      <Image
        accessibilityLabel={name ?? 'Avatar'}
        accessibilityRole="image"
        source={{uri: src}}
        style={{
          borderRadius,
          height: pixelSize,
          width: pixelSize
        }}
        testID={testID}
      />
    );
  }

  let bgColor = getInitialsColor(name);
  let initials = getInitials(name);

  return (
    <View
      accessibilityLabel={name ?? 'Avatar'}
      accessibilityRole="image"
      className={cn(className)}
      style={{
        alignItems: 'center',
        backgroundColor: bgColor,
        borderRadius,
        height: pixelSize,
        justifyContent: 'center',
        width: pixelSize
      }}
      testID={testID}>
      <Text
        style={{
          color: '#ffffff',
          fontSize,
          fontWeight: '600',
          lineHeight: fontSize * 1.2
        }}>
        {initials}
      </Text>
    </View>
  );
}
