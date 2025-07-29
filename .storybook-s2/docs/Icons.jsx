import icons from '../../packages/@react-spectrum/s2/s2wf-icons/*.svg';
import { style } from '../../packages/@react-spectrum/s2/style/spectrum-theme' with {type: 'macro'};
import {ActionButton, Text} from '@react-spectrum/s2';
import {H2, H3, P, Code, Pre, Link} from './typography';
import {highlight} from './highlight' with {type: 'macro'};
import {IconColors} from './Colors';
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';
import {iconStyle} from '../../packages/@react-spectrum/s2/style' with {type: 'macro'};

export function Icons() {
  return (
    <div className={'sb-unstyled ' + style({marginX: 'auto'})}>
      <div className={style({marginX: 48})}>
        <h1 className={style({font: 'heading-2xl', marginBottom: 48})}>
          Workflow icons
        </h1>
        <P>Spectrum 2 offers a subset of the icons currently available in React Spectrum v3. These icons can be imported from <Code>@react-spectrum/s2/icons</Code>.</P>
        <Pre>{highlight("import Add from '@react-spectrum/s2/icons/Add';")}</Pre>
        <P>See below for a full list of available icons. Click to copy import statement.</P>
        <div className={style({display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 48})}>
          {Object.keys(icons).map(icon => {
            let Icon = icons[icon].default;
            let name = icon.replace(/^S2_Icon_(.*?)(Size\d+)?_2.*/, '$1');
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
        <H2>Styling</H2>
        <P>The <Code>iconStyle</Code> macro can be used to set the size and color of a workflow icon. Icons support five t-shirt sizes, and a subset of the Spectrum colors. <Link href="?path=/docs/intro--docs#supported-css-properties-on-spectrum-components">Other style properties</Link> available across components are also supported on icons.</P>
        <Pre>{highlight(`import {iconStyle} from '@react-spectrum/s2/style' with {type: 'macro'};
import CheckmarkCircle from '@react-spectrum/s2/icons/CheckmarkCircle';

<CheckmarkCircle styles={iconStyle({size: 'L', color: 'positive'})} />`)}</Pre>
        <H3>Icon colors</H3>
        <IconColors />
        <H3>Icon sizes</H3>
        <div className={style({display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end'})}>
          <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
            <CheckmarkCircle styles={iconStyle({size: 'XS'})} />
            <span className={style({font: 'ui-sm'})}>XS (14px)</span>
          </div>
          <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
            <CheckmarkCircle styles={iconStyle({size: 'S'})} />
            <span className={style({font: 'ui-sm'})}>S (16px)</span>
          </div>
          <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
            <CheckmarkCircle styles={iconStyle({size: 'M'})} />
            <span className={style({font: 'ui-sm', fontWeight: 'bold'})}>M (20px)</span>
          </div>
          <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
            <CheckmarkCircle styles={iconStyle({size: 'L'})} />
            <span className={style({font: 'ui-sm'})}>L (22px)</span>
          </div>
          <div className={style({display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4})}>
            <CheckmarkCircle styles={iconStyle({size: 'XL'})} />
            <span className={style({font: 'ui-sm'})}>XL (26px)</span>
          </div>
        </div>
        <H2>Custom icons</H2>
        <P>To use custom icons, you first need to convert your SVGs into compatible icon components. This depends on your bundler.</P>
        <H3>Parcel</H3>
        <P>If you are using Parcel, the <Code>@react-spectrum/parcel-transformer-s2-icon</Code> plugin can be used to convert SVGs to icon components. First install it into your project as a dev dependency:</P>
        <Pre>yarn add @react-spectrum/parcel-transformer-s2-icon --dev</Pre>
        <P>Then, add it to your <Code>.parcelrc</Code>:</P>
        <Pre>{highlight(`{
  "extends": "@parcel/config-default",
  "transformers": {
    "icon:*.svg": ["@react-spectrum/parcel-transformer-s2-icon"]
  }
}`)}</Pre>
        <P>Now you can import icon SVGs using the <Code>icon:</Code> <Link href="https://parceljs.org/features/plugins/#named-pipelines">pipeline</Link>:</P>
        <Pre>{highlight(`import Icon from 'icon:./path/to/Icon.svg';`)}</Pre>
        <H3>Other bundlers</H3>
        <P>The <Code>@react-spectrum/s2-icon-builder</Code> CLI tool can be used to pre-process a folder of SVG icons into TSX files.</P>
        <Pre>npx @react-spectrum/s2-icon-builder -i 'path/to/icons/*.svg' -o 'path/to/destination'</Pre>
        <P>This outputs a folder of TSX files with names corresponding to the input SVG files. You may rename them as you wish. To use them in your application, import them like normal components.</P>
        <Pre>{highlight(`import Icon from './path/to/destination/Icon';`)}</Pre>
      </div>
    </div>
  );
}
