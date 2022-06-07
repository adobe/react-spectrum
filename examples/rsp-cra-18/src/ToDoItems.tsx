import React from "react";

function TodoItems(props: { list : {id: number; task: string}[]; handleList: any}) {

    // const [items, setItems] = React.useState(props.list);

    function removeItem(id: number){
        // console.log(`remove ${id}`)
    
        props.handleList(props.list.filter(item => item.id !== id));
        // setItems(prevItems => prevItems.filter(item => item.id !== id))
        // console.log(items)
        // props.change(items)
    };

    const elements = props.list.map(item => (
        <p onClick={() => removeItem(item.id)} key={item.id}>{item.task}</p>
    ))
    
    return (
        <div className="item">
            {elements}
        </div>
    );
}

export default TodoItems;