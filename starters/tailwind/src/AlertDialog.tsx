import { AlertCircleIcon, InfoIcon } from "lucide-react";
import { Dialog, DialogProps, Heading } from "react-aria-components";
import { Button } from "./Button";

interface AlertDialogProps extends Omit<DialogProps, 'children'> {
  title: string,
  children: string,
  variant?: 'info' | 'destructive',
  actionLabel: string,
  cancelLabel?: string
}

export function AlertDialog({
  title,
  variant,
  cancelLabel,
  actionLabel,
  children,
  ...props
}: AlertDialogProps) {
  return (
    <Dialog role="alertdialog" {...props} className="outline-none relative">
      {({ close }) => (
        <>
          <Heading
            slot="title"
            className="text-xl font-semibold leading-6 my-0 text-slate-700">
            {title}
          </Heading>
          <div className={`w-6 h-6 absolute right-0 top-0 stroke-2 ${variant === 'destructive' ? 'text-red-500' : 'text-blue-500'}`}>
            {variant === 'destructive' ? <AlertCircleIcon /> : <InfoIcon />}
          </div>
          <p className="mt-3 text-slate-500">
            {children}
          </p>
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              onPress={close}>
              {cancelLabel || 'Cancel'}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'primary'}
              onPress={close}>
              {actionLabel}
            </Button>
          </div>
        </>
      )}
    </Dialog>
  );
}
