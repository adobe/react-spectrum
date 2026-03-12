'use client';

import {VideoHTMLAttributes} from 'react';

export function Video(props: VideoHTMLAttributes<HTMLVideoElement>) {
  return (
    // eslint-disable-next-line
    <video
      {...props}
      tabIndex={props.autoPlay && !props.controls ? 0 : undefined}
      onClick={(e) => {
        if (props.autoPlay && !props.controls) {
          if (e.currentTarget.paused) {
            e.currentTarget.play();
          } else {
            e.currentTarget.pause();
          }
        }
      }}
      onKeyDown={(e) => {
        if (props.autoPlay && !props.controls && e.key === ' ') {
          e.preventDefault();
          if (e.currentTarget.paused) {
            e.currentTarget.play();
          } else {
            e.currentTarget.pause();
          }
        }
      }} />
  );
}
