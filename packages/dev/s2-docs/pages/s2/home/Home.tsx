import { size, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { getColorScale } from "../../../src/color.macro" with {type: 'macro'};
import { Code } from "../../../src/Code";
import { Pre } from "../../../src/CodePlatter";
import { ObjectStyles } from "./ObjectStyles";
import { DarkMode } from "./DarkMode";
import { AppFrame, ExampleApp } from "./ExampleApp";
import { LinkButton, Provider, Tab, TabList, TabPanel, Tabs } from "@react-spectrum/s2";
import { Mobile } from "./Mobile";
import { Rems } from "./Rems";
// import { PressAnimation } from "./Press";
import { HCM } from "./HCM";
import Lightbulb from '@react-spectrum/s2/illustrations/gradient/generic2/Lightbulb';
import Phone from '@react-spectrum/s2/illustrations/gradient/generic2/Phone';
import Translate from '@react-spectrum/s2/illustrations/gradient/generic2/Translate';
import Animation from '@react-spectrum/s2/illustrations/gradient/generic2/Animation';
import Accessibility from '@react-spectrum/s2/illustrations/gradient/generic2/Accessibility';
import TextIcon from '@react-spectrum/s2/illustrations/gradient/generic2/Text';
import Interaction from '@react-spectrum/s2/illustrations/gradient/generic2/Interaction';
// import Ruler from '@react-spectrum/s2/illustrations/gradient/generic2/Ruler';
import Shapes from '@react-spectrum/s2/illustrations/gradient/generic2/Shapes';
import Color from '@react-spectrum/s2/illustrations/gradient/generic2/Color';
import CodeBrackets from '@react-spectrum/s2/illustrations/gradient/generic2/CodeBrackets';
// import Cursor from '@react-spectrum/s2/illustrations/gradient/generic2/Cursor';
import IllustrationIcon from '@react-spectrum/s2/illustrations/gradient/generic2/Illustration';
import Sparkles from '@react-spectrum/s2/illustrations/gradient/generic2/Sparkles';
import Server from '@react-spectrum/s2/illustrations/gradient/generic2/Server';
import SpeedFast from '@react-spectrum/s2/illustrations/gradient/generic2/SpeedFast';
import VectorDraw from '@react-spectrum/s2/illustrations/gradient/generic2/VectorDraw';
import Layers from '@react-spectrum/s2/illustrations/gradient/generic2/Layers';
import { Icons, Illustrations } from "./Icons";
import { Typography } from "./Typography";
import { States } from "./States";
import { useId } from "react";
import { Responsive } from "./Responsive";
import { mergeStyles } from "../../../../../@react-spectrum/s2/style/runtime";
import { ReduceMotion } from "./ReduceMotion";
import { Colors } from "./Colors";
// import { SubmenuAnimation } from "./SubmenuAnimation";

const container = style({
  backgroundColor: 'layer-2/80',
  boxShadow: 'elevated',
  borderRadius: 'xl',
  padding: {
    default: 16,
    sm: 32
  },
  position: 'relative',
  overflow: 'clip',
  display: 'flex',
  flexDirection: 'column'
});

export function Home() {
  let headingId = useId();
  return (
    <body
      className={style({
        margin: 0
      })}
      style={{
        backgroundImage: 'url(https://s2.spectrum.adobe.com/static/background/bgTop1440.svg), linear-gradient(0deg,#7154fa,#eb1000)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100%'
      }}>
      <header aria-labelledby={headingId} className={style({marginX: 'auto', paddingX: {default: 16, sm: 40}, paddingY: 96, maxWidth: 1024})}>
        <h1 id={headingId} className={style({font: 'heading-3xl', marginY: 0, color: 'white'})}>React Spectrum</h1>
        <p className={style({font: 'body-3xl', marginY: 0, color: 'white'})}>Subtitle</p>
        <div className={style({display: 'flex', gap: 16, flexDirection: {default: 'column', sm: 'row'}, marginTop: 32, marginBottom: 56})}>
          <LinkButton size="XL" staticColor="white" href="getting-started.html">Get started</LinkButton>
          <LinkButton size="XL" staticColor="white" variant="secondary" href="react-spectrum.html">Explore components</LinkButton>
        </div>
        <section aria-label="Example app" className={style({height: 'calc(100svh - 24px)', maxHeight: size(600)})}>
          <ExampleApp showArrows />
        </section>
      </header>
      <main className={style({marginX: 'auto', paddingX: {default: 16, sm: 40}, maxWidth: 1600})}>
        <Section
          title="Build Once. Adapt Everywhere."
          description="React Spectrum makes interfaces more accessible, flexible, and easier to maintain, while giving users a seamless experience no matter where they are.">
          <Feature
            title="Dark mode"
            description="Deliver effortless dark and light mode support, automatically. No extra styling required."
            illustration={<Lightbulb />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 4'}})}>
            <DarkMode />
          </Feature>
          <Feature
            title="Touch friendly"
            description="Components automatically scale adapt and adapt for touch or pointer input, ensuring a smooth experience on any device."
            illustration={<Interaction />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <Mobile />
          </Feature>
          <Feature
            title="Global ready by default"
            description="Automatically mirrors component layouts, and formats text for different languages, currencies, dates, and locales."
            illustration={<Translate />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <Provider
              locale="ar-AE"
              styles={style({
                height: 300,
                containerType: 'inline-size',
                margin: {
                  default: -16,
                  sm: 0
                },
                marginTop: 0,
                '--app-frame-radius-top': {
                  type: 'borderTopStartRadius',
                  value: {
                    default: 'none',
                    sm: 'lg'
                  }
                }
              })}>
              <AppFrame />
            </Provider>
          </Feature>
          <Feature
            title="Reduce motion options"
            description="Component animations and transitions automatically adjust for users who prefer less motion, keeping your UI comfortable and inclusive."
            illustration={<Animation />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <ReduceMotion />
          </Feature>
          {/* <Feature
            title="Space aware"
            description="TagGroup with collapsing"
            illustration={<Ruler />}
            style={{gridColumn: 'span 6'}}>
            <Collapsing />
          </Feature> */}
          <Feature
            title="High contrast mode"
            description="Automatically adjust to high contrast mode, ensuring a clear and readable experience based on preference."
            illustration={<Accessibility />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <HCM />
          </Feature>
          <Feature
            title="Adaptive font sizes"
            description="Fonts scale autoamtically according to user preferences and screen size, fully compatible with rem-based typography, allowing your text to scale naturally."
            illustration={<TextIcon />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 4'}})}>
            <Rems />
          </Feature>
        </Section>
        {/* We will add this section back after we have a few more things (e.g. dnd) */}
        {/* <Section title="Motion that makes sense"
          description="Every interaction — from button presses to drag-and-drop — is polished, fast, and consistent across platforms. ">
          <Feature
            title="Press scaling"
            description="Components respond instantly to user input, with smooth animations and transitions that feel natural and without extra code."
            illustration={<Interaction />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <PressAnimation />
          </Feature>
          <Feature
            title="Submenus"
            description="Description"
            illustration={<Cursor />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 4'}})}>
            <SubmenuAnimation />
          </Feature>
        </Section> */}
        <Section title="Everything you need to build beautiful apps" description="Bring your interface to life with expressive icons, Spectrum colors, and rich illustrations. Every detail works together to make your product look polished and on brand.">
          <Feature
            title="Icons"
            description="Spectrum icon support for your product. Use the icon search to simplify finding the right icon the right experience."
            illustration={<VectorDraw />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <Icons />
          </Feature>
          <Feature
            title="Illustrations"
            description="Rich illustrations that help bring your interface to life. Use the illustration search to find the right illustration for your product."
            illustration={<IllustrationIcon />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <Illustrations />
          </Feature>
        </Section>
        <Section
          title={<>Rapidly style custom components with Style Macros</>}
          description={<>Easily use Spectrum tokens like colors, spacing, and typography in your own custom components with style macros. Styles are <strong>colocated</strong> with your component code, allowing you to <strong>develop more efficiently</strong> and <strong>refactor with confidence</strong> – no more CSS conflicts or specificity issues. Style macros generate atomic CSS at build time, so you get tiny bundle sizes and fast runtime performance.</>}>
          <Feature
            title="Colors"
            description="Testing"
            illustration={<Color />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <ColorScales />
          </Feature>
          <Feature
            title="Typography"
            description="Testing"
            illustration={<TextIcon />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <Typography />
          </Feature>
          <Feature
            title="Object styles"
            description="Testing"
            illustration={<Shapes />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3', xl: 'span 2'}})}>
            <ObjectStyles />
          </Feature>
          <Feature
            title="States and variants"
            description="Testing"
            illustration={<Layers />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 3'}})}>
            <States />
          </Feature>
          <Feature
            title="Reusable utilities"
            description="Macros are just functions, so you can create your own reusable style utilities."
            illustration={<CodeBrackets />}
            styles={style({gridColumnStart: {default: 'span 6', xl: 'span 3'}})}>
            <div className={style({display: 'flex', flexDirection: 'column', gap: 16, flexGrow: 1, justifyContent: 'space-between'})}>
            <div
              className={style({
                backgroundColor: 'layer-2',
                boxShadow: 'elevated',
                padding: {
                  default: 16,
                  sm: 24
                },
                borderRadius: {
                  default: 'none',
                  sm: 'lg'
                },
                overflow: 'auto',
                marginX: {
                  default: -16,
                  sm: 0
                }
              })}>
              <h4 className={style({font: 'title', marginTop: 0})}>Button.tsx</h4>
              <Pre><Code lang="tsx">{`import {style, focusRing} from '@react-spectrum/s2/style' with {type: 'macro'};
import {hstack} from './style-utils' with {type: 'macro'};
            
const buttonStyle = style({
  ...focusRing(),
  ...hstack(4)
});`}</Code></Pre>
            </div>
            <div
              className={style({
                backgroundColor: 'layer-2',
                boxShadow: 'elevated',
                padding: {
                  default: 16,
                  sm: 24
                },
                borderRadius: {
                  default: 'none',
                  sm: 'lg'
                },
                overflow: 'auto',
                margin: {
                  default: -16,
                  sm: 0
                },
                marginTop: 0
              })}>
              <h4 className={style({font: 'title', marginTop: 0})}>style-utils.ts</h4>
              <Pre><Code lang="tsx">{`export function hstack(gap: number) {
  return {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap
  };
}`}</Code></Pre>
            </div>
            </div>
          </Feature>
          <Feature
            title="Responsive design"
            description="Show media/container queries"
            illustration={<Phone />}
            style={{gridColumn: 'span 6'}}>
            <Responsive />
          </Feature>
        </Section>
        <Section
          title="Modern"
          description="Stuff">
          <Feature
            title="AI-ready"
            description="MCP server..."
            illustration={<Sparkles />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 2'}})}>
              
          </Feature>
          <Feature
            title="SSR"
            description="and React Server Components"
            illustration={<Server />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 2'}})}>
              
          </Feature>
          <Feature
            title="Small bundle"
            description="CSS?"
            illustration={<SpeedFast />}
            styles={style({gridColumnStart: {default: 'span 6', lg: 'span 2'}})}>
              
          </Feature>
        </Section>
      </main>
    </body>
  );
}


function Section({title, description, children}: any) {
  let headingId = useId();
  return (
    <section aria-labelledby={headingId} className={style({paddingY: 64})}>
      <h2 id={headingId} className={style({font: 'heading-2xl', color: 'white'})}>{title}</h2>
      <p className={style({font: 'body-2xl', color: 'white', maxWidth: '80%', marginBottom: 64})}>{description}</p>
      <div className={style({display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16})}>
        {children}
      </div>
    </section>
  );
}

function Feature({title, description, illustration, children, style: styleProp, styles = ''}: any) {
  let headingId = useId();
  return (
    <section aria-labelledby={headingId} className={mergeStyles(container, styles)} style={styleProp}>
      <div className={style({display: 'flex', flexDirection: {default: 'column', sm: 'row'}, gap: 12, alignItems: 'start', marginBottom: 12})}>
        <div style={{marginTop: -12, marginInlineStart: -12}}>
          {illustration}
        </div>
        <div>
          <h3 id={headingId} className={style({font: 'heading', marginY: 0})}>{title}</h3>
          <p className={style({font: 'body-lg', marginY: 0})}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ColorScales() {
  const size = 'auto';
  let red = getColorScale('red', size);
  let orange = getColorScale('orange', size);
  let yellow = getColorScale('yellow', size);
  let celery = getColorScale('celery', size);
  let green = getColorScale('green', size);
  let seafoam = getColorScale('seafoam', size);
  let turquoise = getColorScale('turquoise', size);
  let cyan = getColorScale('cyan', size);
  let blue = getColorScale('blue', size);
  let indigo = getColorScale('indigo', size);
  let purple = getColorScale('purple', size);
  let fuchsia = getColorScale('fuchsia', size);
  let magenta = getColorScale('magenta', size);
  let pink = getColorScale('pink', size);

  let scales = [red, orange, yellow, celery, green, seafoam, turquoise, cyan, blue, indigo, purple, fuchsia, magenta, pink];
  return <Colors scales={scales} />
}
