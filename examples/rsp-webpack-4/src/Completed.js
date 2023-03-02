import Delete from '@spectrum-icons/workflow/Delete';
import {AlertDialog, DialogTrigger, ActionButton} from '@adobe/react-spectrum'
import {Checkbox} from '@adobe/react-spectrum'
import {Flex} from '@adobe/react-spectrum'

function Completed(props){

    const elements = props.completed.map(item => (
        <Checkbox isReadOnly isSelected key={item.id}>{item.task}</Checkbox>
    ))

    let alertCancel = () => alert('Cancel button pressed.');

    return (
        <Flex direction="column">
            {elements}
            <DialogTrigger>
                <ActionButton marginTop="size-100" marginEnd="auto">
                    <Delete aria-label="Delete"/>
                </ActionButton>
                <AlertDialog
                    variant="confirmation"
                    title="Delete Items"
                    primaryActionLabel="Delete"
                    cancelLabel="Cancel"
                    autoFocusButton="primary"
                    onPrimaryAction={props.onDelete}
                    onCancel={alertCancel}>
                    Are you sure you want to delete the completed tasks?
                </AlertDialog>
            </DialogTrigger>
        </Flex>

    )
}

export default Completed;
