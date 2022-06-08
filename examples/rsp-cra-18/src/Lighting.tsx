import React from 'react'
import {Menu, MenuTrigger, ActionButton, Item} from '@adobe/react-spectrum'
import {Switch} from '@adobe/react-spectrum'

function Lighting(props : {switch: any; selected: boolean}) {

    let mode = props.selected ? "Light Mode" : "Dark Mode";
    return (
        <>
        <Switch onChange={props.switch}>
            {mode}
        </Switch>
        </>
    );
  }


export default Lighting;
