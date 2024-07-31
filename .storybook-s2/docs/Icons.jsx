import icons from '@react-spectrum/s2/s2wf-icons/*.svg';
import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {ActionButton, Text} from '@react-spectrum/s2';
import {P, Code, Pre} from './typography';
import {highlight} from './highlight' with {type: 'macro'};

export function Icons() {
  return (
    <div className={style({maxWidth: 'lg', marginX: 'auto', fontFamily: 'sans'})}>
      <div className={style({marginX: 48})}>
        <h1 className={style({fontSize: 'heading-2xl', color: 'heading', marginBottom: 48})}>
          Workflow icons
        </h1>
        <P>Spectrum 2 offers a subset of the icons currently available in React Spectrum v3. These icons can be imported from <Code>@react-spectrum/s2/icons</Code>.</P>
        <Pre>{highlight("import Add from '@react-spectrum/s2/icons/Add';")}</Pre>
        <P>See below for a full list of available icons. Click to copy import statement.</P>
        <div className={style({display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 48})}>
          {Object.keys(icons).map(icon => {
            let Icon = icons[icon].default;
            let name = icon.replace(/^S2_Icon_(.*?)_2.*/, '$1');
            let importName = name.replace(/^(\d)/, '_$1');
            return (
              <ActionButton
                key={icon}
                onPress={() => navigator.clipboard.writeText(`import ${importName} from '@react-spectrum/s2/icons/${name}';`)}>
                <Icon />
                <Text>{name}</Text>
              </ActionButton>
            );
          })}
        </div>
      </div>
    </div>
  );
}
