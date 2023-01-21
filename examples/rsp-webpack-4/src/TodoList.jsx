import './App.css';
import {Flex, TextField, Button, Form, Divider} from '@adobe/react-spectrum'
import ToDoItems from "./ToDoItems"
import Completed from "./Completed"


function TodoList(props){

    return (
    <>
        <Form onSubmit={props.handleSubmit} maxWidth="size-6000">
            <Flex direction="column">
                <Flex direction='row' height='size-800' gap='size-200'
                    alignItems={"end"}>
                    <TextField label="Enter Task"
                                width="size-5000"
                                value={props.value}
                                onChange={props.setValue}
                                isRequired/>
                    <Button variant="cta" type="submit">Submit</Button>
                </Flex>
                <h2>To-Do</h2>
                <ToDoItems list={props.list} handleList={props.setList} updateCompleted={props.updateCompleted}/>
            </Flex>
        </Form>
        <Divider marginTop="size-300" marginBottom="size-300" />
        <h2>Completed</h2>
        <Completed completed={props.completed} onDelete={props.clearCompleted}/>
    </>
    );
}

export default TodoList;
