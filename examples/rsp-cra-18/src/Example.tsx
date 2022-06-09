import React from "react"
import {CheckboxGroup, Checkbox} from '@adobe/react-spectrum'
import {RadioGroup, Radio} from '@adobe/react-spectrum'



// function Example() {
//     let [selected, setSelected] = React.useState('');
  
//     return (
//       <>
//         <RadioGroup
//           label="Favorite avatar"
//           value={selected}
//           onChange={setSelected}
//         >
//           <Radio value="wizard">Wizard</Radio>
//           <Radio value="dragon">Dragon</Radio>
//         </RadioGroup>
//         <div>You have selected: {selected}</div>
//       </>
//     );
//   }

function Example() {
    let [selected, setSelected] = React.useState(['']);
  
    return (
      <>
        <CheckboxGroup
          label="Favorite sports"
          value={selected}
          onChange={setSelected}
        >
          <Checkbox value="soccer">Soccer</Checkbox>
          <Checkbox value="baseball">Baseball</Checkbox>
          <Checkbox value="basketball">Basketball</Checkbox>
        </CheckboxGroup>
        <div>You have selected: {selected.join(', ')}</div>
      </>
    );
  }

// function Example() {
//     let [selected, setSelected] = React.useState([]);
  
//     return (
//       <CheckboxGroup
//         label="Sandwich condiments"
//         value={selected}
//         onChange={setSelected}
//         isRequired
//         validationState={selected.length === 0 ? 'invalid' : null}
//       >
//         <Checkbox value="lettuce">Lettuce</Checkbox>
//         <Checkbox value="tomato">Tomato</Checkbox>
//         <Checkbox value="onion">Onion</Checkbox>
//         <Checkbox value="sprouts">Sprouts</Checkbox>
//       </CheckboxGroup>
//     );
//   }