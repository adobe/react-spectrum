import Delete from '@spectrum-icons/workflow/Delete';
import {AlertDialog, DialogTrigger, ActionButton} from '@adobe/react-spectrum'
import {Checkbox} from '@adobe/react-spectrum'
import {Flex} from '@adobe/react-spectrum'


function Completed(props: {completed: {id: number; task: string}[]; onDelete: any}){

    const elements = props.completed.map(item => (
        <Checkbox isDisabled key={item.id}>{item.task}</Checkbox>
    ))

    let onSecondaryAction = () => alert('Canceled')

    return (
        <Flex direction="column">
            {elements}
            <DialogTrigger>
                <ActionButton marginTop="size-100" width="size-0">
                    <Delete aria-label="Delete"/>
                </ActionButton>
                <AlertDialog
                    variant="confirmation"
                    title="Delete Items"
                    primaryActionLabel="Delete"
                    cancelLabel="Cancel"
                    autoFocusButton="primary"
                    onPrimaryAction={props.onDelete}
                    onSecondaryAction={onSecondaryAction}>
                    Are you sure you want to delete the completed tasks?
                </AlertDialog>
            </DialogTrigger>
        </Flex>

    )
}

export default Completed;
