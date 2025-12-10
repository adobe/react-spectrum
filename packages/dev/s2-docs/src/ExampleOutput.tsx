'use client';

import {cloneElement, Component, createElement, isValidElement, ReactNode} from 'react';
import {Content, Heading, InlineAlert} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

interface ExampleOutputProps {
  component?: any,
  props?: Record<string, any>,
  align?: 'start' | 'center' | 'end',
  orientation?: 'horizontal' | 'vertical'
}

export function ExampleOutput({component, props = {}, align = 'center', orientation = 'horizontal'}: ExampleOutputProps) {
  return (
    <div
      role="group"
      aria-label="Rendered component"
      className={style({
        display: 'flex',
        flexDirection: {
          orientation: {
            horizontal: 'column',
            vertical: 'row'
          }
        },
        justifyContent: {
          align: {
            center: 'center',
            start: 'start',
            end: 'end'
          }
        },
        alignItems: 'center',
        width: 'full',
        height: {
          orientation: {
            vertical: 80
          }
        },
        overflow: 'auto',
        gridArea: 'example',
        borderRadius: 'lg',
        font: 'ui',
        padding: {
          default: 12,
          lg: 24
        },
        boxSizing: 'border-box'
      })({align, orientation})}
      style={{background: getBackgroundColor(props.staticColor || (props.isOverBackground ? 'white' : undefined))}}>
      <ErrorBoundary>
        {isValidElement(component) ? cloneElement(component, props) : createElement(component, props)}
      </ErrorBoundary>
    </div>
  );
}

function getBackgroundColor(staticColor: 'black' | 'white' | undefined) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}

class ErrorBoundary extends Component<{children: ReactNode}, {error: string | null}> {
  constructor(props) {
    super(props);
    this.state = {error: null};
  }

  static getDerivedStateFromError(e: Error) {
    return {error: e.message};
  }

  render() {
    if (this.state.error) {
      return (
        <InlineAlert variant="negative">
          <Heading>Error</Heading>
          <Content>{this.state.error}</Content>
        </InlineAlert>
      );
    }

    return this.props.children;
  }
}
