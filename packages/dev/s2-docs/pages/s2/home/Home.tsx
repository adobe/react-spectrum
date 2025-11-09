import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { getColorScale } from "../../../src/color.macro" with {type: 'macro'};
import { Fragment } from "react/jsx-runtime";
import { Code } from "../../../src/Code";
import { Pre } from "../../../src/CodePlatter";
import { ObjectStyles } from "./ObjectStyles";
import { DarkMode } from "./DarkMode";
import { ExampleApp } from "./ExampleApp";
import { Provider } from "@react-spectrum/s2";
import { Mobile } from "./Mobile";
import { ExampleApp2 } from "./ExampleApp2";
import { Rems } from "./Rems";

const container = style({
  backgroundColor: 'layer-2',
  boxShadow: 'elevated',
  borderRadius: 'xl',
  padding: 32,
  overflow: 'clip'
});

export function Home() {
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
      <header className={style({marginX: 'auto', paddingY: 96, maxWidth: 1024})}>
        <h1 className={style({font: 'heading-3xl', margin: 0, color: 'white'})}>React Spectrum</h1>
        <div style={{height: 400}}>Hero</div>
      </header>
      <main className={style({marginX: 'auto', paddingX: 40, maxWidth: 1600})}>
        <Section
          title="Build Once. Adapt Everywhere."
          description="React Spectrum makes interfaces more accessible, flexible, and easier to maintain, while giving users a seamless experience no matter where they are.">
          <Feature
            title="Dark mode"
            description="Deliver effortless dark and light mode support, automatically. No extra styling required."
            style={{gridColumn: 'span 4'}}>
            <DarkMode />
          </Feature>
          <Feature
            title="Touch friendly"
            description="Components automatically scale adapt and adapt for touch or pointer input, ensuring a smooth experience on any device."
            style={{gridColumn: 'span 2'}}>
            <Mobile />
          </Feature>
          <Feature
            title="Global ready by default"
            description="Automatically mirrors component layouts, and formats text for different languages, currencies, dates, and locales."
            style={{gridColumn: 'span 3'}}>
            <Provider locale="ar-AE" background="layer-1" styles={style({padding: 16, borderRadius: 'lg', overflow: 'clip', boxSizing: 'border-box', height: 300})}>
              <ExampleApp />
            </Provider>
          </Feature>
          <Feature
            title="Reduce motion options"
            description="Component animations and transitions automatically adjust for users who prefer less motion, keeping your UI comfortable and inclusive."
            style={{gridColumn: 'span 3'}}>
          </Feature>
          <Feature
            title="Space aware"
            description="TagGroup with collapsing"
            style={{gridColumn: 'span 6'}}>
          </Feature>
          <Feature
            title="High contrast mode"
            description="Automatically adjust to high contrast mode, ensuring a clear and readable experience based on preference."
            style={{gridColumn: 'span 2'}}>
          </Feature>
          <Feature
            title="Adaptive font sizes"
            description="Fonts scale autoamtically according to user preferences and screen size, fully compatible with rem-based typography, allowing your text to scale naturally."
            style={{gridColumn: 'span 4'}}>
            <Rems />
          </Feature>
        </Section>
        <Section title="Interactions"
          description="Components respond instantly to user input, with smooth animations and transitions that feel natural and without extra code.">
          <Feature
            title="Press scaling"
            description="Description"
            style={{gridColumn: 'span 2'}}>
            
          </Feature>
          <Feature
            title="Submenus"
            description="Description"
            style={{gridColumn: 'span 4'}}>
            
          </Feature>
        </Section>
        <Section title="Everything you need to build beautiful apps" description="Stuff and things">
          <Feature
            title="Icons"
            description="Description"
            style={{gridColumn: 'span 3'}}>
            
          </Feature>
          <Feature
            title="Illustrations"
            description="Description"
            style={{gridColumn: 'span 3'}}>
            
          </Feature>
        </Section>
        <Section
          title={<>Rapidly style custom components with Style Macros</>}
          description={<>Easily use Spectrum tokens like colors, spacing, and typography in your own custom components with style macros. Styles are <strong>colocated</strong> with your component code, allowing you to <strong>develop more efficiently</strong> and <strong>refactor with confidence</strong> – no more CSS conflicts or specificity issues. Style macros generate atomic CSS at build time, so you get tiny bundle sizes and fast runtime performance.</>}>
          {/* colocation? atomic? */}
          <Feature
            title="Colors"
            description="Testing"
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
            style={{gridColumn: 'span 2'}}>
            <div
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
            </div>
          </Feature>
          <Feature
            title="Object styles"
            description="Testing"
            style={{gridColumn: 'span 2'}}>
            <ObjectStyles />
          </Feature>
          <Feature
            title="Responsive design"
            description="Show media/container queries"
            style={{gridColumn: 'span 3'}}>
            
          </Feature>
          <Feature
            title="Conditional styles"
            description="Testing"
            style={{gridColumn: 'span 3'}}>
            <Pre><Code lang="tsx">{`import {Checkbox} from 'react-aria-components';

<Checkbox
  className={style({
    backgroundColor: {
      default: 'gray-100',
      isHovered: 'gray-200',
      isSelected: 'gray-900'
    }
  })} />`}</Code></Pre>
          </Feature>
          <Feature
            title="Reusable utilities"
            description="Macros are just functions, so you can create your own reusable style utilities."
            style={{gridColumn: 'span 6'}}>
            <Pre><Code lang="tsx">{`import {style, focusRing} from '@react-spectrum/s2/style' with {type: 'macro'};
import {flexRow} from './style-utils' with {type: 'macro'};
            
const buttonStyle = style({
  ...focusRing(),
  ...flexRow(4)
})`}</Code></Pre>
          </Feature>
        </Section>
        <Section
          title="Modern"
          description="Stuff">
          <Feature
            title="AI-ready"
            description="MCP server..."
            style={{gridColumn: 'span 3'}}>
              
          </Feature>
          <Feature
            title="SSR"
            description="and React Server Components"
            style={{gridColumn: 'span 1'}}>
              
          </Feature>
          <Feature
            title="Small bundle"
            description="CSS?"
            style={{gridColumn: 'span 1'}}>
              
          </Feature>
        </Section>
      </main>
    </body>
  );
}


function Section({title, description, children}: any) {
  return (
    <section className={style({paddingY: 64})}>
      <h2 className={style({font: 'heading-2xl', color: 'white'})}>{title}</h2>
      <p className={style({font: 'body-2xl', color: 'white', maxWidth: '80%', marginBottom: 64})}>{description}</p>
      <div className={style({display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16})}>
        {children}
      </div>
    </section>
  );
}

function Feature({title, description, children, style: styleProp}: any) {
  return (
    <section className={container} style={styleProp}>
      <h3 className={style({font: 'heading', marginY: 0})}>{title}</h3>
      <p className={style({font: 'body'})}>{description}</p>
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
    return <Fragment key={i}>{scale.map(([name, className]) => <div key={String(name)} className={String(className)} />)}</Fragment>
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
