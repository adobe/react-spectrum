import React from "react";
import './App.css';
import {Flex, TextField, Button, Form, Divider} from '@adobe/react-spectrum'
import ToDoItems from "./ToDoItems"
import Completed from "./Completed"

function TodoList() {

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

            //used to determine the key for each item in the list object
            setCount(prevCount => {
                return prevCount + 1;
            })
        }   

        setValue(""); //clears text field on submit
    }

    function updateCompleted(complete : string){
        setCompleted(prevListArray => {
            return [
                ...prevListArray, 
                {id: prevListArray.length, task: complete}]
        });
    }

    function clearCompleted(){
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
