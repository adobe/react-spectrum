export interface ToggleState {
<<<<<<< HEAD
  checked: boolean,
  setChecked: (value:boolean) => void
=======
  isChecked: boolean,
  setChecked: (value:boolean, e:ChangeEvent<HTMLInputElement>) => void
>>>>>>> 46ab0b1132a8c70e509b91d42c7b81a3760d516d
}
