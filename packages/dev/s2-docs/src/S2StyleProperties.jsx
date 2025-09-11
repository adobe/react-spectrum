import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const Code = ({children}) => <code className={style({font: 'code'})}>{children}</code>;

export function S2StyleProperties() {
  return (
    <ul className={style({fontSize: 'body-lg', lineHeight: 'body', color: 'body', padding: 0, listStyleType: 'none'})} style={{columns: 3}}>
      <li><Code>margin</Code></li>
      <li><Code>marginStart</Code></li>
      <li><Code>marginEnd</Code></li>
      <li><Code>marginTop</Code></li>
      <li><Code>marginBottom</Code></li>
      <li><Code>marginX</Code></li>
      <li><Code>marginY</Code></li>
      <li><Code>width</Code></li>
      <li><Code>minWidth</Code></li>
      <li><Code>maxWidth</Code></li>
      <li><Code>flexGrow</Code></li>
      <li><Code>flexShrink</Code></li>
      <li><Code>flexBasis</Code></li>
      <li><Code>justifySelf</Code></li>
      <li><Code>alignSelf</Code></li>
      <li><Code>order</Code></li>
      <li><Code>gridArea</Code></li>
      <li><Code>gridRow</Code></li>
      <li><Code>gridRowStart</Code></li>
      <li><Code>gridRowEnd</Code></li>
      <li><Code>gridColumn</Code></li>
      <li><Code>gridColumnStart</Code></li>
      <li><Code>gridColumnEnd</Code></li>
      <li><Code>position</Code></li>
      <li><Code>zIndex</Code></li>
      <li><Code>top</Code></li>
      <li><Code>bottom</Code></li>
      <li><Code>inset</Code></li>
      <li><Code>insetX</Code></li>
      <li><Code>insetY</Code></li>
      <li><Code>insetStart</Code></li>
      <li><Code>insetEnd</Code></li>
    </ul>
  );
}
