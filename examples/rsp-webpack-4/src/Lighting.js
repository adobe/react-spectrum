import {Switch} from '@adobe/react-spectrum'

function Lighting(props) {

    let mode = props.selected ? "Light Mode" : "Dark Mode";
    return (
        <Switch onChange={props.switch}>
            {mode}
        </Switch>
    );
  }


export default Lighting;
