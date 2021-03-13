import React from "react";
import { Button } from "@react-spectrum/button";

export default function Sample() {
    return (
        <div>
            <Button variant="cta"
                onPress={ () => console.log("Clicked!") }
            >
                Hello React Spectrum
            </Button>
        </div>
    )
}