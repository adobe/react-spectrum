import React from "react";
import {ListBox, Item, Section} from '@adobe/react-spectrum'


function TodoItems(props: { list : {id: number; task: string}[]; 
                            handleList: any; 
                            updateCompleted: any}) {

    let [itemId, setItemId] = React.useState();

    function removeItem(id: number, task: string){    

        let index = getIndex(props.list, id, task);

        props.updateCompleted(props.list[index].task);
        props.handleList(props.list.filter(item => item.id !== id));
        // console.log(props.list)
    };

    function getIndex(list : {id: number; task: string}[], id: number, task: string){
        for (let i = 0; i < list.length; i++){
            let item = list[i];
            if (item.task === task && item.id === id){
                return i;
            }
        }
        return -1;
    }

    const elements = props.list.map(item => (
        // <Item>
        //     {item.task}
        // </Item>
        <p onClick={() => removeItem(item.id, item.task)} key={item.id}>{item.task}</p>
    ))
    
    return (
        // <ListBox 
        //     items={props.list}
        //     onSelectionChange={setItemId}>
        //     {elements}
        // </ListBox>

        <div>
            {elements}
        </div>
    );
}

export default TodoItems;