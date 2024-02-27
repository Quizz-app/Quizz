import React from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";



const Home = () => {
    const [date, setDate] = React.useState(new Date());
    console.log(date)
    return (
        <>
            <Button>Hello world</Button>
            <div className="mt-5 mb-5">
                

            </div>
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