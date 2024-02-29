import {baseColor, style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {clamp} from '@react-aria/utils';
import {keyframes} from '../style-macro/style-macro' with {type: 'macro'};
import {mergeStyles} from '../style-macro/runtime';
import {ProgressBar as RACProgressBar, ProgressBarProps as RACProgressBarProps} from 'react-aria-components';
import React, {CSSProperties} from 'react';
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';

export interface ProgressCircleStyleProps {
  size?: 'S' | 'M' | 'L',
  // TODO: not sure if black exists, not in the designs
  staticColor?: 'black' | 'white',
  isIndeterminate?: boolean

}

const fillMask1Frames = keyframes(`
0% {
  transform: rotate(90deg);
}

1.69% {
  transform: rotate(72.3deg);
}

3.39% {
  transform: rotate(55.5deg);
}

5.08% {
  transform: rotate(40.3deg);
}

6.78% {
  transform: rotate(25deg);
}

8.47% {
  transform: rotate(10.6deg);
}

10.17%, 40.68% {
  transform: rotate(0deg);
}

42.37% {
  transform: rotate(5.3deg);
}

44.07% {
  transform: rotate(13.4deg);
}

45.76% {
  transform: rotate(20.6deg);
}

47.46% {
  transform: rotate(29deg);
}

49.15% {
  transform: rotate(36.5deg);
}

50.85% {
  transform: rotate(42.6deg);
}

52.54% {
  transform: rotate(48.8deg);
}

54.24% {
  transform: rotate(54.2deg);
}

55.93% {
  transform: rotate(59.4deg);
}

57.63% {
  transform: rotate(63.2deg);
}

59.32% {
  transform: rotate(67.2deg);
}

61.02% {
  transform: rotate(70.8deg);
}

62.71% {
  transform: rotate(73.8deg);
}

64.41% {
  transform: rotate(76.2deg);
}

66.1% {
  transform: rotate(78.7deg);
}

67.8% {
  transform: rotate(80.6deg);
}

69.49% {
  transform: rotate(82.6deg);
}

71.19% {
  transform: rotate(83.7deg);
}

72.88% {
  transform: rotate(85deg);
}

74.58% {
  transform: rotate(86.3deg);
}

76.27% {
  transform: rotate(87deg);
}

77.97% {
  transform: rotate(87.7deg);
}

79.66% {
  transform: rotate(88.3deg);
}

81.36% {
  transform: rotate(88.6deg);
}

83.05% {
  transform: rotate(89.2deg);
}

84.75% {
  transform: rotate(89.2deg);
}

86.44% {
  transform: rotate(89.5deg);
}

88.14% {
  transform: rotate(89.9deg);
}

89.83% {
  transform: rotate(89.7deg);
}

91.53% {
  transform: rotate(90.1deg);
}

93.22% {
  transform: rotate(90.2deg);
}

94.92% {
  transform: rotate(90.1deg);
}

96.61% {
  transform: rotate(90deg);
}

98.31% {
  transform: rotate(89.8deg);
}

100% {
  transform: rotate(90deg);
}
`);

const fillMask2Frames = keyframes(`
0%, 8.47% {
  transform: rotate(180deg);
}

10.17% {
  transform: rotate(179.2deg);
}

11.86% {
  transform: rotate(164deg);
}

13.56% {
  transform: rotate(151.8deg);
}

15.25% {
  transform: rotate(140.8deg);
}

16.95% {
  transform: rotate(130.3deg);
}

18.64% {
  transform: rotate(120.4deg);
}

20.34% {
  transform: rotate(110.8deg);
}

22.03% {
  transform: rotate(101.6deg);
}

23.73% {
  transform: rotate(93.5deg);
}

25.42% {
  transform: rotate(85.4deg);
}

27.12% {
  transform: rotate(78.1deg);
}

28.81% {
  transform: rotate(71.2deg);
}

30.51% {
  transform: rotate(89.1deg);
}

32.2% {
  transform: rotate(105.5deg);
}

33.9% {
  transform: rotate(121.3deg);
}

35.59% {
  transform: rotate(135.5deg);
}

37.29% {
  transform: rotate(148.4deg);
}

38.98% {
  transform: rotate(161deg);
}

40.68% {
  transform: rotate(173.5deg);
}

42.37%, 100% {
  transform: rotate(180deg);
}
`);

const fillsRotate = keyframes(`
0% {transform: rotate(-90deg)}
100% {transform: rotate(270deg)}
`);

const circleDims = {
  height: {
    default: 8,
    size: {
      S: 4,
      L: 16
    }
  },
  width: {
    default: 8,
    size: {
      S: 4,
      L: 16
    }
  },
  aspectRatio: 'square'
} as const;

// Double check the types passed to each style, may not need all for each
const wrapper = style<ProgressCircleStyleProps>({
  ...circleDims,
  display: 'inline-block',
  position: 'relative'
});

const trackStyles = {
  ...circleDims,
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: {
    // TODO: this needs to be 3 for default but that doesn't exist
    default: '[3px]',
    size: {
      S: 2,
      L: 4
    }
  },
  borderRadius: 'full'
} as const;

const track = style<ProgressCircleStyleProps>({
  ...trackStyles,
  borderColor: {
    default: baseColor('gray-300'),
    staticColor: {
      white: {
        default: baseColor('transparent-white-300'),
        forcedColors: 'Background'
      },
      // TODO: no designs for this one
      black: {
        default: baseColor('transparent-black-300'),
        forcedColors: 'Background'
      }
    },
    forcedColors: 'Background'
  }
});

const fill = style<ProgressCircleStyleProps>({
  ...trackStyles,
  borderColor: {
    default: baseColor('blue-900'),
    staticColor: {
      white: {
        default: baseColor('transparent-white-900'),
        forcedColors: 'Highlight'
      },
      // TODO: no designs for this one
      black: {
        default: baseColor('transparent-black-900'),
        forcedColors: 'Highlight'
      }
    },
    forcedColors: 'Highlight'
  }
});

const fillsWrapperStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: 'full',
  height: 'full'
} as const;

const fillsWrapper = style({
  ...fillsWrapperStyles
});

const fillsWrapperIndeterminate = style({
  ...fillsWrapperStyles,
  willChange: 'transform',
  transform: 'translateZ(0)',
  animation: fillsRotate,
  animationDuration: 1000,
  animationTimingFunction: '[cubic-bezier(.25,.78,.48,.89)]',
  animationIterationCount: 'infinite',
  transformOrigin: 'center'
});

const commonFillMask = {
  position: 'absolute',
  width: '1/2',
  height: 'full',
  transformOrigin: '[100% center]',
  overflow: 'hidden'
} as const;

const fillMask1 = style({
  ...commonFillMask,
  transform: 'rotate(180deg)'
});

const fillMask2 = style({
  ...commonFillMask,
  transform: 'rotate(0deg)'
});

const commonFillSubMask = {
  width: 'full',
  height: 'full',
  transformOrigin: '[100% center]',
  transform: 'rotate(-180deg)',
  overflow: 'hidden'
} as const;

const commonFillSubMaskIndeterminate = {
  transform: 'translateZ(0)',
  willChange: 'transform',
  animationDuration: 1000,
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite'
} as const;

const fillSubMask = style({
  ...commonFillSubMask
});

const fillSubMask1Indeterminate = style({
  ...commonFillSubMask,
  animation: fillMask1Frames,
  ...commonFillSubMaskIndeterminate
});

const fillSubMask2Indeterminate = style({
  ...commonFillSubMask,
  animation: fillMask2Frames,
  ...commonFillSubMaskIndeterminate
});
interface ProgressCircleProps extends Omit<RACProgressBarProps, 'children' | 'style' | 'valueLabel' | 'formatOptions' | 'label' | 'className'>, ProgressCircleStyleProps {
  className?: string,
  UNSAFE_className?: string
}

function ProgressCircle(props: ProgressCircleProps, ref: DOMRef<HTMLDivElement>) {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    size = 'M',
    staticColor,
    isIndeterminate = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    UNSAFE_className
  } = props;
  let domRef = useDOMRef(ref);

  value = clamp(value, minValue, maxValue);

  let subMask1Style: CSSProperties = {};
  let subMask2Style: CSSProperties = {};
  if (!isIndeterminate) {
    let percentage = (value - minValue) / (maxValue - minValue) * 100;
    let angle;
    if (percentage > 0 && percentage <= 50) {
      angle = -180 + (percentage / 50 * 180);
      subMask1Style.transform = `rotate(${angle}deg)`;
      subMask2Style.transform = 'rotate(-180deg)';
    } else if (percentage > 50) {
      angle = -180 + (percentage - 50) / 50 * 180;
      subMask1Style.transform = 'rotate(0deg)';
      subMask2Style.transform = `rotate(${angle}deg)`;
    }
  }

  if (!ariaLabel && !ariaLabelledby) {
    console.warn('ProgressCircle requires an aria-label or aria-labelledby attribute for accessibility');
  }

  return (
    <RACProgressBar
      {...props}
      ref={domRef}
      className={renderProps => mergeStyles(props.className, UNSAFE_className, wrapper({
        ...renderProps,
        size
      }))}>
      <div dir="ltr">
        <div className={track({size, staticColor})} />
        <div className={isIndeterminate ? fillsWrapperIndeterminate() : fillsWrapper()}>
          <div className={fillMask1()}>
            <div
              className={isIndeterminate ? fillSubMask1Indeterminate() : fillSubMask()}
              style={subMask1Style}>
              <div className={fill({size, staticColor})} />
            </div>
          </div>
          <div className={fillMask2()}>
            <div
              className={isIndeterminate ? fillSubMask2Indeterminate() : fillSubMask()}
              style={subMask2Style}>
              <div className={fill({size, staticColor})} />
            </div>
          </div>
        </div>
      </div>
    </RACProgressBar>
  );
}

/**
 * ProgressCircles show the progression of a system operation such as downloading, uploading, or processing, in a visual way.
 * They can represent determinate or indeterminate progress.
 */
let _ProgressCircle = React.forwardRef(ProgressCircle);
export {_ProgressCircle as ProgressCircle};
