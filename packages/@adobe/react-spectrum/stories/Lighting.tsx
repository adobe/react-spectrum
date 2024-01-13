/* eslint-disable */
import React from 'react';
import {Switch} from '@react-spectrum/switch';

function Lighting(props : {switch: any, selected: boolean}) {

    let mode = props.selected ? "Light Mode" : "Dark Mode";
    return (
        <Switch onChange={props.switch}>
            {mode}
        </Switch>
    );
  }


export default Lighting;
