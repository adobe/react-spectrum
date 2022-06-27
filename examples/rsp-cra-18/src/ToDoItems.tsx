import {CheckboxGroup, Checkbox, Flex} from '@adobe/react-spectrum'
import ToDo from './ToDo'


function TodoItems(props: { list : ToDo[]; 
                            handleList: any; 
                            updateCompleted: any}) {

    function removeItem(id: number){
        
        //add selected item to the completed list
        const found = props.list.find(element => element.id === id)
        if (found){
            props.updateCompleted(found.task); 
        }

        //remove the item from the list
        props.handleList(props.list.filter(item => item.id !== id));
    }

    const elements = props.list.map(item => (
        <Checkbox onChange={() => removeItem(item.id)} 
                    key={item.id} 
                    value={item.task}>
            {item.task}
        </Checkbox>
    ))
    
    return (
            <CheckboxGroup aria-label="to-do list">
                <Flex direction="column">
                    {elements}
                </Flex>
            </CheckboxGroup>
    );
}

export default TodoItems;