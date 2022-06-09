import React from "react";
import './App.css';
import {Flex} from '@adobe/react-spectrum'
import {TextField, Button} from '@adobe/react-spectrum'
import {Form} from '@adobe/react-spectrum'
import ToDoItems from "./ToDoItems"
import Completed from "./Completed"
import {Divider} from '@adobe/react-spectrum'



function TodoList() {

    // let [list, setList] = React.useState<string[]>([]);
    const [list, setList] = React.useState<{id: number; task: string}[]>([]);
    const [value, setValue] = React.useState('')
    const [completed, setCompleted] = React.useState<{id: number; task: string}[]>([]);
    const [count, setCount] = React.useState(0);

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault()

        if (value.length > 0){
            setList(prevListArray => {
                return [
                    ...prevListArray, 
                    {id: count, task: value}]
            })

            setCount(prevCount => {
                return prevCount + 1;
            })
        }   

        setValue("");
    }

    function updateCompleted(complete : string){
        setCompleted(prevListArray => {
            return [
                ...prevListArray, 
                {id: prevListArray.length, task: complete}]
        });
    }

    function clearCompleted(){
        console.log('delete button clicked')
        setCompleted(() => {
            return [];
        })
    }

    return (
    <>
        <Form onSubmit={handleSubmit} maxWidth="size-6000">
            <Flex direction="column">
                <Flex direction='row' height='size-800' gap='size-200'
                    alignItems={"end"}>
                    <TextField label="Enter Task"
                                width="size-5000"
                                value={value}
                                onChange={setValue}
                                isRequired/>
                    <Button variant="cta" type="submit">Submit</Button>
                </Flex>
                <h2>To-Do</h2> 
                <ToDoItems list={list} handleList={setList} updateCompleted={updateCompleted}/>
            </Flex>
        </Form>
        <Divider marginTop="size-300" marginBottom="size-300" />
        <h2>Completed</h2>
        <Completed completed={completed} onDelete={clearCompleted}/>
    </>
    );
}

export default TodoList;
