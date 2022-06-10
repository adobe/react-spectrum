import {Flex, Divider} from '@adobe/react-spectrum'

function JournalEntries(props : {list : {rate: React.Key, description: string, id: number}[]}){

    const element = props.list.map(item => (
        <div key={item.id}>
            <Divider size="M" marginTop="size-200" marginBottom="size-300" />
            <p>Your day was: {item.rate} </p>
            <p>{item.description}</p>
        </div>
        
    ))

    return (
        <Flex direction="column">
            {element}
        </Flex>
    )
}

export default JournalEntries;