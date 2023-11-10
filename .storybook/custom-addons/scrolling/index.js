import {addons, makeDecorator} from '@storybook/addons';
import clsx from 'clsx';
import {getQueryParams} from '@storybook/client-api';
import React, {useEffect, useState} from 'react';
import {useViewportSize} from '@react-aria/utils';

function ScrollingDecorator(props) {
  let {children} = props;
  let [isScrolling, setScrolling] = useState(getQueryParams()?.scrolling === 'true' || false);
  let {height: minHeight} = useViewportSize();

  useEffect(() => {
    let channel = addons.getChannel();
    let updateScrolling = (val) => {
      setScrolling(val);
    };
    channel.on('scrolling/updated', updateScrolling);
    return () => {
      channel.removeListener('scrolling/updated', updateScrolling);
    };
  }, []);

  let styles = {alignItems: 'center', boxSizing: 'border-box', display: 'flex', justifyContent: 'center'};
  if (isScrolling) {
    return (
      <div style={{overflow: 'auto', height: '100vh', width: '100vw'}}>
        <StoryWrapper style={{...styles, height: '300vh', width: '300vw'}}>
          {children}
        </StoryWrapper>
      </div>
    );
  } else {
    return (
      <StoryWrapper style={{...styles, minHeight: minHeight}}>
        {children}
      </StoryWrapper>
    );
  }
}

function StoryWrapper({children, className, style}) {
  return (
    <div
      className={clsx('react-spectrum-story', className)}
      style={style}
    >
      <span style={{position: 'absolute', top: 0, left: 0}}>{React.version}</span>
      {children}
    </div>
  );
}

export const withScrollingSwitcher = (Story) => {
  return (
    <ScrollingDecorator>
      <Story />
    </ScrollingDecorator>
  )
}
