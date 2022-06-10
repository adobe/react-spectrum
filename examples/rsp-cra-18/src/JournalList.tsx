import React from 'react'
import AddCircle from '@spectrum-icons/workflow/AddCircle';
import {Flex, Text, Button, Form, TextArea, Picker, Item, Divider} from '@adobe/react-spectrum'
import JournalEntries from './JournalEntries'

function JournalList(){
    let [rating, setRating] = React.useState<React.Key>('');
    let [entryList, setEntryList] = React.useState<{rate: React.Key, description: string, id: number}[]>([]);
    let [value, setValue] = React.useState('');
    let [count, setCount] = React.useState(0);

    let options = [
        {id: "Bad", name: "Bad"},
        {id: "Okay", name: "Okay"},
        {id: "Good", name: "Good"},
        {id: "Great", name: "Great"}
    ]

    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault()

        setCount(prevCount => prevCount + 1) //used to determine key for each item in the entryList array

        setEntryList(prevListArray => {
            return [
                ...prevListArray,
                {rate: rating, description: value, id: count}
            ]
        })

        setValue('') //clears the text area when submitted
    }
    
    return(
        <>
            <Form onSubmit={handleSubmit} maxWidth="size-6000">
                <Flex direction="column" marginTop="size-300" gap="size-100">
                    <Picker label="How Was Your Day?"
                            items={options}
                            onSelectionChange={(selected) => setRating(selected)}
                    >
                        {(item) => <Item key={item.id}>{item.name}</Item>}
                   </Picker>
                    <TextArea width="size-5000" label="Description" 
                                value={value}
                                onChange={setValue}/>
                    <Button type="submit" marginTop="size-200" variant="primary" width="150px">
                        <AddCircle aria-label="add circle" />
                        <Text marginEnd="size-200">Add Entry</Text>
                    </Button>
                </Flex>
            </Form>
            <Divider marginTop="size-600" marginBottom="size-300" />
            <h2>Entries</h2>
            <JournalEntries list={entryList}/>
        </>
    )
}

export default JournalList;