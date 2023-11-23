import {Button as RACButton, ButtonProps} from 'react-aria-components';

export function Button(props: ButtonProps) {
    return (
        <>
            <div className="text-white text-3xl font-bold underline">Button</div>
            <RACButton {...props} />
        </>
    );
}
