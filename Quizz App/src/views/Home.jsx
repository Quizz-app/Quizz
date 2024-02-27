import React from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar"



const Home = () => {
    const [date, setDate] = React.useState(new Date());
    console.log(date)
    return (
        <>
            <Button>Hello world</Button>
            <Menubar>
                <MenubarContent>
                    {<MenubarItem/>}
                    </MenubarContent>
            </Menubar>

            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
            />

        </>
    );
};

export default Home;