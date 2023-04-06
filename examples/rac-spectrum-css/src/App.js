
import {Button} from 'react-aria-components';
import clsx from 'clsx';
import React from 'react';
import {
  SlotProvider,
  useSlotProps
} from '@react-spectrum/utils';

function SButton(props) {
  let {size = 'M', children, styleP: style = 'fill', variant = 'accent'} = props;

  return (
    <Button
      {...props}
      className={({isFocused, isFocusVisible, isHovered, isPressed, isDisabled}) => {
        return clsx(
          'spectrum-Button',
          `spectrum-Button--${style}`,
          `spectrum-Button--${variant}`,
          `spectrum-Button--size${size}`,
          {
            'is-focused': isFocused && isFocusVisible,
            'is-active': isPressed,
            'is-hovered': isHovered,
            'is-disabled': isDisabled
          }
        );
      }}>
      <SlotProvider
        slots={{
          icon: {
            size,
            className: clsx('spectrum-Icon')
          },
          text: {
            className: clsx('spectrum-Button-label')
          }
        }}>
        {typeof children === 'string'
          ? <Text>{children}</Text>
          : children}
      </SlotProvider>
    </Button>
  );
}

function Text(props) {
  props = useSlotProps(props, 'text');
  return <span className="spectrum-Button-label">{props.children}</span>
}

export function App() {
  return (
    <div style={{display: 'flex', gap: '15px'}}>
      <div style={{display: 'flex', gap: '15px', flexDirection: 'column'}}>
        <SButton isDisabled>Disabled</SButton>
        <SButton variant="secondary">Secondary</SButton>
        <SButton styleP="outline">Outline</SButton>
        <SButton variant="negative">Negative</SButton>
      </div>
      <div style={{display: 'flex', gap: '15px', flexDirection: 'column'}}>
        <SButton size="S">S Button</SButton>
        <SButton>M Button</SButton>
        <SButton size="L">L Button</SButton>
        <SButton size="XL">XL Button</SButton>
      </div>
      <div style={{display: 'flex', gap: '15px', flexDirection: 'column'}}>
        <SButton size="S"><EditIcon /><Text>S Button</Text></SButton>
        <SButton><EditIcon /><Text>M Button</Text></SButton>
        <SButton size="L"><EditIcon /><Text>L Button</Text></SButton>
        <SButton size="XL"><EditIcon /><Text>XL Button</Text></SButton>
      </div>
      <div style={{display: 'flex', gap: '15px', flexDirection: 'column'}}>
        <div>Spectrum CSS doesn't support icon only</div>
        <SButton size="S"><EditIcon /></SButton>
        <SButton><EditIcon /></SButton>
        <SButton size="L"><EditIcon /></SButton>
        <SButton size="XL"><EditIcon /></SButton>
      </div>
    </div>
  );
}

function EditIcon(props) {
  props = useSlotProps(props, 'icon');
  let {size = 'M'} = props;
  return (
    <svg {...props} className={`spectrum-Icon spectrum-Icon--size${size}`} viewBox="0 0 36 36">
      <path d="M33.567 8.2 27.8 2.432a1.215 1.215 0 0 0-.866-.353H26.9a1.371 1.371 0 0 0-.927.406L5.084 23.372a.99.99 0 0 0-.251.422L2.055 33.1c-.114.377.459.851.783.851a.251.251 0 0 0 .062-.007c.276-.063 7.866-2.344 9.311-2.778a.972.972 0 0 0 .414-.249l20.888-20.889a1.372 1.372 0 0 0 .4-.883 1.221 1.221 0 0 0-.346-.945ZM11.4 29.316c-2.161.649-4.862 1.465-6.729 2.022l2.009-6.73Z" />
    </svg>
  );
}
