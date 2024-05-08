import {addons} from '@storybook/preview-api';
import clsx from 'clsx';
import {getQueryParams} from '@storybook/preview-api';
import React, {useEffect, useState} from 'react';

function ScrollingDecorator(props) {
  let {children} = props;
  let [isScrolling, setScrolling] = useState(getQueryParams()?.scrolling === 'true' || false);

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
      <StoryWrapper style={{...styles, minHeight: '100svh'}}>
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
