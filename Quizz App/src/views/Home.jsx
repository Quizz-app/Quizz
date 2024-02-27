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
            <div className="stats shadow border">

                <div className="stat place-items-center">
                    <div className="stat-title">Downloads</div>
                    <div className="stat-value">31K</div>
                    <div className="stat-desc">From January 1st to February 1st</div>
                </div>

                <div className="stat place-items-center">
                    <div className="stat-title">Users</div>
                    <div className="stat-value text-secondary">4,200</div>
                    <div className="stat-desc text-secondary">↗︎ 40 (2%)</div>
                </div>

                <div className="stat place-items-center">
                    <div className="stat-title">New Registers</div>
                    <div className="stat-value">1,200</div>
                    <div className="stat-desc">↘︎ 90 (14%)</div>
                </div>

            </div>
        </>
    );
};

export default Home;