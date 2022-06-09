import React from "react";
import {CheckboxGroup, Checkbox, Flex} from '@adobe/react-spectrum'
import { number } from "yargs";


function TodoItems(props: { list : {id: number; task: string}[]; 
                            handleList: any; 
                            updateCompleted: any}) {

    let [selected, setSelected] = React.useState(['']);

    function removeItem(id: number, task: string){    

        let index = getIndex(props.list, task);

        props.updateCompleted(props.list[index].task);
        props.handleList(props.list.filter(item => item.id !== id));
        // console.log(props.list)
    };

    function getIndex(list : {id: number; task: string}[], task: string){
        for (let i = 0; i < list.length; i++){
            let item = list[i];
            if (item.task === task){
                return i;
            }
        }
        return -1;
    }

    // const elements = props.list.map(item => (
    //     <p onClick={() => removeItem(item.id, item.task)} key={item.id}>{item.task}</p>
    // ))

    const elements = props.list.map(item => (
        <Checkbox onChange={() => removeItem(item.id, item.task)} key={item.id} value={item.task}>{item.task}</Checkbox>
    ))
    
    return (
            <CheckboxGroup>
                <Flex direction="column">

                    {elements}
                </Flex>
            </CheckboxGroup>
    );
}

export default TodoItems;