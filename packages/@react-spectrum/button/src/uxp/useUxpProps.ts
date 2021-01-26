
const isUxp = document.location.protocol === "plugin:";

export default function useUxpProps(props: any) {
    if (!isUxp) {
        return null;
    }
    // set elementType to sp-button
    props.elementType = "sp-button";
    const { variant, isQuiet, isDisabled } = props;
    return {
        quiet: isQuiet,
        variant: variant,
        disabled: isDisabled,
    };
}
