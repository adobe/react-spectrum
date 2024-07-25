import {Flex, Divider} from '@adobe/react-spectrum'
import Journal from './Journal'

function JournalEntries(props : {list : Journal[]}){

    const element = props.list.map(item => (
        <li key={item.id}>
            <Divider size="M" marginTop="size-200" marginBottom="size-300" />
            <p>Your day was: {item.rate} </p>
            <p>{item.description}</p>
        </li>

    ))

    return (
        <Flex direction="column">
            <ul className="no-bullets">
                {element}
            </ul>
        </Flex>
    )
}

export default JournalEntries;
