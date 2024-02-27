import React from "react";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";

import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import {  getAllEducators, getAllUsers } from "../services/users-service";
import { useEffect, useState } from "react";
import { get } from "firebase/database";


const Home = () => {
    // const [date, setDate] = React.useState(new Date());
    const [userCount, setUserCount] = useState(0);
    const [educatorCount, setEducatorCount] = useState(0);

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getAllUsers();
            const educators = await getAllEducators();

            setEducatorCount(educators.size);
            setUserCount(users.size);
        };

        fetchUsers();
    }, [userCount, educatorCount]);

    return (
        <>
            {/* <Button>Hello world</Button> */}

            {/* <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
            /> */}

            <div className="flex flex-col items-center justify-center mt-20 ">
                <h1 className="text-4xl text-center font-bold">Become a Master Genius and Get Brainburst!</h1>
            </div>

            <div className="flex items-center justify-center my-10 pb-10">

                <div className="stats shadow border  w-3/4 h-48">

                    <div className="stat place-items-center">
                        <div className="stat-title">Users</div>
                        <div className="stat-value text-secondary">{userCount}</div>
                        <div className="stat-desc text-secondary">↗︎ 54%</div>
                    </div>

                    <div className="stat place-items-center">
                        <div className="stat-title">Educators</div>
                        <div className="stat-value">{educatorCount}</div>
                        <div className="stat-desc text-secondary">↗︎ 67%</div>
                    </div>

                </div>
            </div>


            <div className="flex items-center justify-center">
                <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-3/4"
                >
                    <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/3 h-80">
                                <div className=" w-3/4 h-full">
                                    <Card className="h-full">
                                        <CardContent className="flex aspect-square items-center justify-center  w-full h-full">
                                            <span className="text-3xl font-semibold">{index + 1}</span>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>

            </div>


        </>
    );
};

export default Home;