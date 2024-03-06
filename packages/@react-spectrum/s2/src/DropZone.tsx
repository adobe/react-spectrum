import {DropZoneRenderProps, DropZone as RACDropZone, DropZoneProps as RACDropZoneProps} from 'react-aria-components';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};
import {ReactNode, forwardRef, createContext} from 'react';
import {mergeStyles} from '../style-macro/runtime';
import {IllustratedMessageContext} from './IllustratedMessage';
import {DOMRef} from '@react-types/shared';
import {useDOMRef} from '@react-spectrum/utils';

interface DropZoneProps extends Omit<RACDropZoneProps, 'className' | 'style' | 'children' | 'isDisabled'>{
  className?: string,
  /** The content to display in the drop zone. */
  children?: ReactNode,
  /** Whether the drop zone has been filled. */
  isFilled?: boolean,
  /** The message to replace the default banner message that is shown when the drop zone is filled. */
  replaceMessage?: string
}

const dropzone = style<DropZoneRenderProps>({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  fontFamily: 'sans',
  color: 'gray-900',
  borderStyle: {
    default: 'dashed',
    isDropTarget: 'solid'
  },
  backgroundColor: {
    isDropTarget: 'blue-200'
  },
  borderWidth: 2,
  borderColor: {
    default: 'gray-300',
    isDropTarget: 'blue-800',
    isFocusVisible: 'blue-800'
  },
  borderRadius: 'lg',
  padding: 6
});

const banner = style<DropZoneRenderProps>({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 5,
  maxWidth: 52,
  backgroundColor: 'accent',
  borderRadius: 'default',
  color: 'white',
  fontWeight: 'bold',
  padding: '[calc((self(minHeight))/1.5)]'
});

export const S2DropZoneContext = createContext<DropZoneRenderProps | null>(null);

function DropZone(props: DropZoneProps, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);

  return (
    <RACDropZone
      {...props}
      ref={domRef}
      className={renderProps => mergeStyles(props.className, dropzone(renderProps))}>
      {renderProps => (
        <>
          <IllustratedMessageContext.Provider value={{isInDropZone: true, isDropTarget: renderProps.isDropTarget}}>
            {props.children}
          </IllustratedMessageContext.Provider>
          {(renderProps.isDropTarget && props.isFilled) && 
            <div className={banner(renderProps)}>
              <span>
                {props.replaceMessage ? props.replaceMessage : 'Drop file to replace'}
              </span>
            </div>
          }
        </>
      )}
    </RACDropZone>
  );
}

let _DropZone = forwardRef(DropZone);
export {_DropZone as DropZone};
