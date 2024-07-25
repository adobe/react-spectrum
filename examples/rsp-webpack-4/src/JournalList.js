import AddCircle from '@spectrum-icons/workflow/AddCircle';
import {Flex, Text, Button, Form, TextArea, Picker, Item, Divider} from '@adobe/react-spectrum'
import JournalEntries from './JournalEntries'

function JournalList(props){
    return(
        <>
            <Form onSubmit={props.handleSubmit} maxWidth="size-6000">
                <Flex direction="column" marginTop="size-300" gap="size-100">
                    <Picker label="How Was Your Day?"
                            items={props.options}
                            onSelectionChange={(selected) => props.setRating(selected)}
                    >
                        {(item) => <Item key={item.id}>{item.name}</Item>}
                   </Picker>
                    <TextArea width="size-5000" label="Description"
                                value={props.description}
                                onChange={props.setDescription}/>
                    <Button type="submit" marginTop="size-200" variant="primary" width="150px">
                        <AddCircle aria-label="add circle" />
                        <Text marginEnd="size-200">Add Entry</Text>
                    </Button>
                </Flex>
            </Form>
            <Divider marginTop="size-600" marginBottom="size-300" />
            <h2>Entries</h2>
            <JournalEntries list={props.entryList}/>
        </>
    )
}

export default JournalList;
