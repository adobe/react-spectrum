import {useRef} from 'react';
import {Separator as RACSeparator, SeparatorProps as RACSeparatorProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};

/*
 * Adding as it's own type to deal with size being a part of the theme so we
 * can type style() and it's parameters.
 */
interface DividerSpectrumProps {
  /**
   * How thick the Divider should be.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /**
   * How thick the Divider should be.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical',
  staticColor?: 'white' | 'black'
}

interface DividerProps extends DividerSpectrumProps, RACSeparatorProps {}

export function Divider(props: DividerProps) {
  let ref = useRef(null);

  return (
    <RACSeparator
      {...props}
      ref={ref}
      className={style<DividerSpectrumProps>({
        alignSelf: 'stretch', /* hr elements are given a default margin, reset it so that flex can work */
        backgroundColor: {
          default: 'gray-200',
          size: {
            L: 'gray-800'
          },
          staticColor: {
            white: {
              default: 'transparent-white-200',
              size: {
                L: 'transparent-white-800'
              }
            },
            black: {
              default: 'transparent-black-200',
              size: {
                L: 'transparent-black-800'
              }
            }
          },
          forcedColors: 'ButtonBorder'
        },
        borderStyle: 'none',
        borderRadius: 'full',
        height: {
          orientation: {
            horizontal: {
              default: 1,
              size: {
                S: 'px',
                M: .5,
              }
            }
          }
        },
        margin: 0, /* hr elements are given a default margin, reset it so that flex can work */
        width: {
          orientation: {
            vertical: {
              default: 1,
              size: {
                S: 'px',
                M: .5,
              }
            }
          }
        }
      })({size: props.size || 'M', orientation: props.orientation || 'horizontal', staticColor: props.staticColor})} />
  );
}
