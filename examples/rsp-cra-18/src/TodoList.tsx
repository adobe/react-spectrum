import React from "react";
import './App.css';
import {Flex} from '@adobe/react-spectrum'
import {TextField, Button} from '@adobe/react-spectrum'
import {Form} from '@adobe/react-spectrum'
import ToDoItems from "./ToDoItems";



function TodoList() {

    // let [list, setList] = React.useState<string[]>([]);
    const [list, setList] = React.useState<{id: number; task: string}[]>([]);
    const [value, setValue] = React.useState('')

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault()
        // console.log('You clicked submit');
        // console.log(value);
        setList(prevListArray => {
            return [
                ...prevListArray, 
                {id: prevListArray.length, task: value}]
        })

        setValue("");
    }

    return (
    <Form onSubmit={handleSubmit} maxWidth="size-3600">
        <Flex direction="column">
            <Flex direction='row' height='size-800' gap='size-100'
                alignItems={"end"}>
                <TextField label="Enter Task"
                            value={value}
                            onChange={setValue}/>
                <Button variant="cta" type="submit">Submit</Button>
            </Flex>
            <ToDoItems list={list} handleList={setList}/>
        </Flex>
    </Form>
    );
}

export default TodoList;
