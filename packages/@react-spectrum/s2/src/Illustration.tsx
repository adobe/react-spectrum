import {cloneElement, createContext, ReactElement, SVGAttributes} from 'react';
import {filterDOMProps} from '@react-aria/utils';
import {AriaLabelingProps, DOMProps} from '@react-types/shared';
import {ContextValue, useContextProps} from 'react-aria-components';

export interface IllustrationProps extends DOMProps, AriaLabelingProps {
  /**
   * A screen reader only label for the Illustration.
   */
  'aria-label'?: string,
  /**
   * The content to display. Should be an SVG.
   */
  children: ReactElement,
  /**
   * A slot to place the illustration in.
   * @default 'illustration'
   */
  slot?: string,
  /**
   * Indicates whether the element is exposed to an accessibility API.
   */
  'aria-hidden'?: boolean | 'false' | 'true'
}

export const IllustrationContext = createContext<ContextValue<SVGAttributes<HTMLOrSVGImageElement>, HTMLOrSVGImageElement>>({});

export function Illustration(props: IllustrationProps) {
  [props] = useContextProps(props, null, IllustrationContext);

  let {
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-hidden': ariaHidden,
    ...otherProps
  } = props;

  let hasLabel = ariaLabel || ariaLabelledby;

  if (!ariaHidden) {
    ariaHidden = undefined;
  }
  
  return cloneElement(children, {
    ...filterDOMProps(otherProps),
    focusable: 'false',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-hidden': ariaHidden,
    role: hasLabel ? 'img' : undefined,
    ...props
  });
}
