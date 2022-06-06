import React from "react";
import './App.css';
import {Flex} from '@adobe/react-spectrum'
import {TextField, Button} from '@adobe/react-spectrum'
import {Form} from '@adobe/react-spectrum'



function TodoList() {

    let [list, setList] = React.useState<string[]>([]);
    let [value, setValue] = React.useState('')

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault()
        console.log('You clicked submit');
        console.log(value);

        setList(prevListArray => {
            return [...prevListArray, value]
        })
    }

    return (
    <Form onSubmit={handleSubmit} maxWidth="size-3600">
        <Flex direction='row' height='size-800' gap='size-100'
            alignItems={"end"}>
            <TextField label="Enter Task"
                        value={value}
                        onChange={setValue}/>
            <Button variant="cta" type="submit">Submit</Button>
            {list} 
        </Flex>
    </Form>
    );
}

export default TodoList;
