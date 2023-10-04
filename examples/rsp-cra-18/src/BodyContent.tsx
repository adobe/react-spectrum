import {useState, FormEvent, Key, useRef} from "react";
import {Item, TabList, TabPanels, Tabs} from '@adobe/react-spectrum'
import TodoList from './TodoList';
import JournalList from './JournalList';
import ToDo from './ToDo'
import Journal from './Journal'

function BodyContent(){

  //states for the To-Do list
  const [list, setList] = useState<ToDo[]>([]);
  const [value, setValue] = useState('');
  const [completed, setCompleted] = useState<ToDo[]>([]);
  const count = useRef(0);

  //states for journal entries
  const [rating, setRating] = useState<Key>('');
  const [entryList, setEntryList] = useState<Journal[]>([]);
  const [description, setDescription] = useState('');
  const countJournals = useRef(0);

  const options = [
    {id: "Bad", name: "Bad"},
    {id: "Okay", name: "Okay"},
    {id: "Good", name: "Good"},
    {id: "Great", name: "Great"}
  ]

  //functions for the To-Do list
  function handleSubmitToDo(e: FormEvent<HTMLInputElement>){
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
  function handleSubmitJournals(e: FormEvent<HTMLInputElement>){
      e.preventDefault()

      countJournals.current = countJournals.current + 1; //used to determine key for each item in the entryList array

      setEntryList(prevListArray => {
          return [
              ...prevListArray,
              {rate: rating, description: description, id: countJournals.current}
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
