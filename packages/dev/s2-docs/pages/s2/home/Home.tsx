import { size, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { getColorScale } from "../../../src/color.macro" with {type: 'macro'};
import { Fragment } from "react/jsx-runtime";
import { Code } from "../../../src/Code";
import { Pre } from "../../../src/CodePlatter";
import { ObjectStyles } from "./ObjectStyles";
import { DarkMode } from "./DarkMode";
import { AppFrame, ExampleApp } from "./ExampleApp";
import { Provider } from "@react-spectrum/s2";
import { Mobile } from "./Mobile";
import { ExampleApp2 } from "./ExampleApp2";
import { Rems } from "./Rems";
import { Collapsing } from "./Collapsing";
import { PressAnimation } from "./Press";
import { HCM } from "./HCM";
import Lightbulb from '@react-spectrum/s2/illustrations/gradient/generic2/Lightbulb';
import Phone from '@react-spectrum/s2/illustrations/gradient/generic2/Phone';
import Translate from '@react-spectrum/s2/illustrations/gradient/generic2/Translate';
import Animation from '@react-spectrum/s2/illustrations/gradient/generic2/Animation';
import Accessibility from '@react-spectrum/s2/illustrations/gradient/generic2/Accessibility';
import TextIcon from '@react-spectrum/s2/illustrations/gradient/generic2/Text';
import Interaction from '@react-spectrum/s2/illustrations/gradient/generic2/Interaction';
import Ruler from '@react-spectrum/s2/illustrations/gradient/generic2/Ruler';
import Shapes from '@react-spectrum/s2/illustrations/gradient/generic2/Shapes';
import Color from '@react-spectrum/s2/illustrations/gradient/generic2/Color';
import CodeBrackets from '@react-spectrum/s2/illustrations/gradient/generic2/CodeBrackets';
import Cursor from '@react-spectrum/s2/illustrations/gradient/generic2/Cursor';
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

const container = style({
  backgroundColor: 'layer-2/80',
  boxShadow: 'elevated',
  borderRadius: 'xl',
  padding: 32,
  position: 'relative',
  overflow: 'clip'
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
      <header aria-labelledby={headingId} className={style({marginX: 'auto', paddingY: 96, maxWidth: 1024})}>
        <h1 id={headingId} className={style({font: 'heading-3xl', marginTop: 0, marginBottom: 48, color: 'white'})}>React Spectrum</h1>
        <section aria-label="Example app" className={style({height: size(600)})}>
          <ExampleApp />
        </section>
      </header>
      <main className={style({marginX: 'auto', paddingX: 40, maxWidth: 1600})}>
        <Section
          title="Build Once. Adapt Everywhere."
          description="React Spectrum makes interfaces more accessible, flexible, and easier to maintain, while giving users a seamless experience no matter where they are.">
          <Feature
            title="Dark mode"
            description="Deliver effortless dark and light mode support, automatically. No extra styling required."
            illustration={<Lightbulb />}
            style={{gridColumn: 'span 4'}}>
            <DarkMode />
          </Feature>
          <Feature
            title="Touch friendly"
            description="Components automatically scale adapt and adapt for touch or pointer input, ensuring a smooth experience on any device."
            illustration={<Interaction />}
            style={{gridColumn: 'span 2'}}>
            <Mobile />
          </Feature>
          <Feature
            title="Global ready by default"
            description="Automatically mirrors component layouts, and formats text for different languages, currencies, dates, and locales."
            illustration={<Translate />}
            style={{gridColumn: 'span 3'}}>
            <Provider locale="ar-AE" styles={style({height: 300})}>
              <AppFrame />
            </Provider>
          </Feature>
          <Feature
            title="Reduce motion options"
            description="Component animations and transitions automatically adjust for users who prefer less motion, keeping your UI comfortable and inclusive."
            illustration={<Animation />}
            style={{gridColumn: 'span 3'}}>
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
            style={{gridColumn: 'span 2'}}>
            <HCM />
          </Feature>
          <Feature
            title="Adaptive font sizes"
            description="Fonts scale autoamtically according to user preferences and screen size, fully compatible with rem-based typography, allowing your text to scale naturally."
            illustration={<TextIcon />}
            style={{gridColumn: 'span 4'}}>
            <Rems />
          </Feature>
        </Section>
        <Section title="Motion that makes sense"
          description="Every interaction — from button presses to drag-and-drop — is polished, fast, and consistent across platforms. ">
          <Feature
            title="Press scaling"
            description="Components respond instantly to user input, with smooth animations and transitions that feel natural and without extra code."
            illustration={<Interaction />}
            style={{gridColumn: 'span 2'}}>
            <PressAnimation />
          </Feature>
          <Feature
            title="Submenus"
            description="Description"
            illustration={<Cursor />}
            style={{gridColumn: 'span 4'}}>
            
          </Feature>
        </Section>
        <Section title="Everything you need to build beautiful apps" description="Bring your interface to life with expressive icons, Spectrum colors, and rich illustrations. Every detail works together to make your product look polished and on brand.">
          <Feature
            title="Icons"
            description="Spectrum icon support for your product. Use the icon search to simplify finding the right icon the right experience."
            illustration={<VectorDraw />}
            style={{gridColumn: 'span 3'}}>
            <Icons />
          </Feature>
          <Feature
            title="Illustrations"
            description="Rich illustrations that help bring your interface to life. Use the illustration search to find the right illustration for your product."
            illustration={<IllustrationIcon />}
            style={{gridColumn: 'span 3'}}>
            <Illustrations />
          </Feature>
        </Section>
        <Section
          title={<>Rapidly style custom components with Style Macros</>}
          description={<>Easily use Spectrum tokens like colors, spacing, and typography in your own custom components with style macros. Styles are <strong>colocated</strong> with your component code, allowing you to <strong>develop more efficiently</strong> and <strong>refactor with confidence</strong> – no more CSS conflicts or specificity issues. Style macros generate atomic CSS at build time, so you get tiny bundle sizes and fast runtime performance.</>}>
          {/* colocation? atomic? */}
          <Feature
            title="Colors"
            description="Testing"
            illustration={<Color />}
            style={{gridColumn: 'span 2'}}>
            <Pre><Code lang="ts">{`style({color: 'red-400'})`}</Code></Pre>
            <Colors />
          </Feature>
          {/* <Feature
            title="Spacing"
            description="Testing"
            style={{gridColumn: 'span 1'}}>
            
          </Feature> */}
          <Feature
            title="Typography"
            description="Testing"
            illustration={<TextIcon />}
            style={{gridColumn: 'span 2'}}>
            <Typography
              titleLg={<Code lang="ts">{`style({font: 'title-lg'})`}</Code>}
              titleSm={<Code lang="ts">{`style({font: 'title-sm'})`}</Code>}
              detailSm={<Code lang="ts">{`style({font: 'detail-sm'})`}</Code>}
              body={<Code lang="ts">{`style({font: 'body'})`}</Code>} />
            {/* <div
              className={style({
                backgroundColor: 'layer-1',
                padding: 24,
                borderRadius: 'lg',
                display: 'grid',
                gridTemplateColumns: ['auto', '1fr'],
                alignItems: 'center',
                columnGap: 24
              })}>
              <pre className={style({font: 'code-sm', textAlign: 'end'})}><Code lang="ts">{`style({font: 'heading'})`}</Code></pre>
              <h3 className={style({font: 'heading'})}>Heading</h3>
              <pre className={style({font: 'code-sm', textAlign: 'end'})}><Code lang="ts">{`style({font: 'title'})`}</Code></pre>
              <h3 className={style({font: 'title'})}>Title</h3>
              <pre className={style({font: 'code-sm', textAlign: 'end'})}><Code lang="ts">{`style({font: 'body'})`}</Code></pre>
              <p className={style({font: 'body'})}>Body</p>
              <pre className={style({font: 'code-sm', textAlign: 'end'})}><Code lang="ts">{`style({font: 'detail'})`}</Code></pre>
              <p className={style({font: 'detail'})}>Detail</p>
              <pre className={style({font: 'code-sm', textAlign: 'end'})}><Code lang="ts">{`style({font: 'ui'})`}</Code></pre>
              <p className={style({font: 'ui'})}>ui</p>
            </div> */}
          </Feature>
          <Feature
            title="Object styles"
            description="Testing"
            illustration={<Shapes />}
            style={{gridColumn: 'span 2'}}>
            <ObjectStyles />
          </Feature>
          <Feature
            title="States and variants"
            description="Testing"
            illustration={<Layers />}
            style={{gridColumn: 'span 3'}}>
            <States />
          </Feature>
          <Feature
            title="Reusable utilities"
            description="Macros are just functions, so you can create your own reusable style utilities."
            illustration={<CodeBrackets />}
            style={{gridColumn: 'span 3'}}>
            <Pre><Code lang="tsx">{`import {style, focusRing} from '@react-spectrum/s2/style' with {type: 'macro'};
import {flexRow} from './style-utils' with {type: 'macro'};
            
const buttonStyle = style({
  ...focusRing(),
  ...flexRow(4)
})`}</Code></Pre>
          </Feature>
          <Feature
            title="Responsive design"
            description="Show media/container queries"
            illustration={<Phone />}
            style={{gridColumn: 'span 6'}}>
            
          </Feature>
        </Section>
        <Section
          title="Modern"
          description="Stuff">
          <Feature
            title="AI-ready"
            description="MCP server..."
            illustration={<Sparkles />}
            style={{gridColumn: 'span 2'}}>
              
          </Feature>
          <Feature
            title="SSR"
            description="and React Server Components"
            illustration={<Server />}
            style={{gridColumn: 'span 2'}}>
              
          </Feature>
          <Feature
            title="Small bundle"
            description="CSS?"
            illustration={<SpeedFast />}
            style={{gridColumn: 'span 2'}}>
              
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

function Feature({title, description, illustration, children, style: styleProp}: any) {
  let headingId = useId();
  return (
    <section aria-labelledby={headingId} className={container} style={styleProp}>
      <div className={style({display: 'flex', columnGap: 12, alignItems: 'start', marginBottom: 12})}>
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

function Colors() {
  let red = getColorScale('red');
  let orange = getColorScale('orange');
  let yellow = getColorScale('yellow');
  let celery = getColorScale('celery');
  let green = getColorScale('green');
  let seafoam = getColorScale('seafoam');
  let turquoise = getColorScale('turquoise');
  let cyan = getColorScale('cyan');
  let blue = getColorScale('blue');
  let indigo = getColorScale('indigo');
  let purple = getColorScale('purple');
  let fuchsia = getColorScale('fuchsia');
  let magenta = getColorScale('magenta');
  let pink = getColorScale('pink');

  let swatches = [red, orange, yellow, celery, green, seafoam, turquoise, cyan, blue, indigo, purple, fuchsia, magenta, pink].map((scale, i) => {
    return (
      <Fragment key={i}>
        {scale.map(([name, className]) => (
          <div
            key={String(name)}
            className={String(className)}
            role="img"
            aria-label={name as string} />
        ))}
      </Fragment>
    )
  });

  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateColumns: 'repeat(16, 1fr)',
        gap: 4
      })}>
      {swatches}
    </div>
  )
}
