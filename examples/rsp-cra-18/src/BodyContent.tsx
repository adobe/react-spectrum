import React from "react";
import {Item, TabList, TabPanels, Tabs} from '@adobe/react-spectrum'
import TodoList from './TodoList';
import JournalList from './JournalList';

function BodyContent(){

  //states for the To-Do list
  const [list, setList] = React.useState<{id: number; task: string}[]>([]);
  const [value, setValue] = React.useState('');
  const [completed, setCompleted] = React.useState<{id: number; task: string}[]>([]);
  const count = React.useRef(0);

  //states for journal entries
  let [rating, setRating] = React.useState<React.Key>('');
  let [entryList, setEntryList] = React.useState<{rate: React.Key, description: string, id: number}[]>([]);
  let [description, setDescription] = React.useState('');
  let countJournals = React.useRef(0);

  let options = [
    {id: "Bad", name: "Bad"},
    {id: "Okay", name: "Okay"},
    {id: "Good", name: "Good"},
    {id: "Great", name: "Great"}
  ] 

  //functions for the To-Do list
  function handleSubmitToDo(e: React.FormEvent<HTMLInputElement>){
    e.preventDefault()

    if (value.length > 0){
        setList(prevListArray => {
            return [
                ...prevListArray, 
                {id: count.current, task: value}]
        })

        count.current = count.current + 1;
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

  //functions for journal entries
  function handleSubmitJournals(e: React.FormEvent<HTMLInputElement>){
      e.preventDefault()

      countJournals.current = countJournals.current + 1; //used to determine key for each item in the entryList array

      setEntryList(prevListArray => {
          return [
              ...prevListArray,
              {rate: rating, description: value, id: countJournals.current}
          ]
      })

      setValue('') //clears the text area when submitted
  }

  return(

    <Tabs aria-label="Different Productivity Tabs">
      <TabList>
        <Item key="TdL">To-do List</Item>
        <Item key="DJ">Daily Journal</Item>
      </TabList>
      <TabPanels>
        <Item key="TdL">
          <TodoList list={list} 
                    setList={setList} 
                    handleSubmit={handleSubmitToDo} 
                    value={value} 
                    setValue={setValue} 
                    completed={completed}
                    updateCompleted={updateCompleted}
                    clearCompleted={clearCompleted}/>
        </Item>
        <Item key="DJ">
            <JournalList rating={rating} 
                          setRating={setRating} 
                          entryList={entryList}
                          options={options}
                          description={description}
                          setDescription={setDescription}
                          handleSubmit={handleSubmitJournals}/>
        </Item>
      </TabPanels>
    </Tabs>
  )
}

export default BodyContent;