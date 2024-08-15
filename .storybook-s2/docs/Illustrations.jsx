import linearIllustrations from '@react-spectrum/s2/spectrum-illustrations/linear/*.tsx';
import gradientIllustrations from '@react-spectrum/s2/spectrum-illustrations/gradient/*.svg';
import Paste from '@react-spectrum/s2/s2wf-icons/S2_Icon_Paste_20_N.svg';
import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {ActionButton, Text} from '@react-spectrum/s2';
import {H2, P, Code, Pre} from './typography';
import {highlight} from './highlight' with {type: 'macro'};
import { Radio, RadioGroup } from '../../packages/@react-spectrum/s2/src';
import { useState } from 'react';

export function Illustrations() {
  let [gradientStyle, setStyle] = useState('generic1');
  return (
    <div className={style({maxWidth: 'lg', marginX: 'auto'})}>
      <div className={style({marginX: 48})}>
        <h1 className={style({font: 'heading-2xl', marginBottom: 48})}>
          Illustrations
        </h1>
        <P>Spectrum 2 offers a collection of illustrations in two styles: gradient and linear. These illustrations can be imported from <Code>@react-spectrum/s2/illustrations</Code>. See below for a full list of available illustrations. Click the clipboard icon to copy the import statement.</P>
        <H2>Gradient illustrations</H2>
        <P>Gradient illustrations are available in two styles: Generic 1 and Generic 2. These should be consistently applied within products. They can be imported using the corresponding sub-path, for example:</P>
        <Pre>{highlight("import Cloud from '@react-spectrum/s2/illustrations/gradient/generic1/Cloud';")}</Pre>
        <RadioGroup label="Style" value={gradientStyle} onChange={setStyle} orientation="horizontal" styles={style({marginTop: 32})}>
          <Radio value="generic1">Generic 1</Radio>
          <Radio value="generic2">Generic 2</Radio>
        </RadioGroup>
        <div className={style({display: 'grid', gridTemplateColumns: 'repeat(auto-fit, 164px)', gap: 20, justifyContent: 'space-between', marginTop: 32})}>
          {Object.keys(gradientIllustrations).filter(name => name.includes(gradientStyle)).map(icon => {
            let Illustration = gradientIllustrations[icon].default;
            let name = icon.replace(/^S2_(fill|lin)_(.+)_(generic\d)_(\d+)$/, (m, type, name) => {
              return name[0].toUpperCase() + name.slice(1).replace(/_/g, '');
            });
            let importPath = icon.replace(/^S2_(fill|lin)_(.+)_(generic\d)_(\d+)$/, (m, type, name, style) => {
              name = name[0].toUpperCase() + name.slice(1).replace(/_/g, '');
              return 'gradient/' + style + '/' + name;
            });
            return (
              <div className={style({display: 'flex', flexDirection: 'column', rowGap: 8, alignItems: 'center', padding: 16, borderRadius: 'lg', boxShadow: 'elevated'})}>
                <Illustration UNSAFE_style={{width: 96, height: 96}} />
                <span className={style({font: 'ui', display: 'flex', gap: 8, alignItems: 'center', maxWidth: 'full'})}>
                  <span className={style({truncate: true})}>{name}</span>
                  <ActionButton
                    size="XS"
                    isQuiet
                    aria-label="Copy"
                    onPress={() => navigator.clipboard.writeText(`import ${name} from '@react-spectrum/s2/illustrations/${importPath}';`)}>
                    <Paste />
                  </ActionButton>
                </span>
              </div>
            );
          })}
        </div>
        <H2>Linear illustrations</H2>
        <P>Linear illustrations can be imported as shown below:</P>
        <Pre>{highlight("import Cloud from '@react-spectrum/s2/illustrations/linear/Cloud';")}</Pre>
        <div className={style({display: 'grid', gridTemplateColumns: 'repeat(auto-fit, 164px)', gap: 20, justifyContent: 'space-between', marginTop: 48})}>
          {Object.keys(linearIllustrations).map(icon => {
            let Illustration = linearIllustrations[icon].default;
            return (
              <div className={style({display: 'flex', flexDirection: 'column', rowGap: 8, alignItems: 'center', padding: 16, borderRadius: 'lg', boxShadow: 'elevated'})}>
                <Illustration />
                <span className={style({font: 'ui', display: 'flex', gap: 8, alignItems: 'center', maxWidth: 'full'})}>
                  <span className={style({truncate: true})}>{icon}</span>
                  <ActionButton
                    size="XS"
                    isQuiet
                    aria-label="Copy"
                    onPress={() => navigator.clipboard.writeText(`import ${icon} from '@react-spectrum/s2/illustrations/linear/${icon}';`)}>
                    <Paste />
                  </ActionButton>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
