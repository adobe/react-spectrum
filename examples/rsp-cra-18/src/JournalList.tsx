import React from 'react'
import AddCircle from '@spectrum-icons/workflow/AddCircle';
import {Flex} from '@adobe/react-spectrum'
import {Text} from '@adobe/react-spectrum'
import {Button} from '@adobe/react-spectrum'
import {Form} from '@adobe/react-spectrum'
import {TextArea} from '@adobe/react-spectrum'
import {Picker, Item, Section} from '@adobe/react-spectrum'


function JournalList(){
    let [rating, setRating] = React.useState<React.Key>();
    
    let options = [
        {id: "Bad", name: "Bad"},
        {id: "Okay", name: "Okay"},
        {id: "Good", name: "Good"},
        {id: "Great", name: "Great"}
    ]
    return(
        <>
            <Form maxWidth="size-6000">
                <Flex direction="column" marginTop="size-300" gap="size-100">
                    <Picker label="How Was Your Day?"
                            items={options}
                            onSelectionChange={(selected) => setRating(selected)}
                    >
                        {(item) => <Item key={item.id}>{item.name}</Item>}
                    </Picker>
                    <TextArea width="size-5000" label="Description" />
                    <Button type="submit" variant="primary">
                        <AddCircle aria-label="add circle" />
                        <Text marginEnd="size-200">Add Entry</Text>
                    </Button>
                </Flex>
            </Form>
        </>
    )
}

export default JournalList;