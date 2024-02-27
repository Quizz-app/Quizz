import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getAllEducators, getAllUsers } from "../services/users-service";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";


const Home = () => {
    // const [date, setDate] = React.useState(new Date());
    const { user, userData } = useContext(AppContext);
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
            {/* <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow"
            /> */}


            {/* <div className="carousel carousel-center rounded-box mt-10">
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.jpg" alt="Pizza" />
                </div>
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.jpg" alt="Pizza" />
                </div>
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.jpg" alt="Pizza" />
                </div>
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1494253109108-2e30c049369b.jpg" alt="Pizza" />
                </div>
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1550258987-190a2d41a8ba.jpg" alt="Pizza" />
                </div>
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1559181567-c3190ca9959b.jpg" alt="Pizza" />
                </div>
                <div className="carousel-item">
                    <img src="https://daisyui.com/images/stock/photo-1601004890684-d8cbf643f5f2.jpg" alt="Pizza" />
                </div>
            </div> */}

            {user ? []
                :
                <>
                    {/* //hero */}
                    <div className="flex flex-col items-center justify-center mt-20 ">
                        <h1 className="text-4xl text-center font-bold">Become a Master Genius and Get Brainburst!</h1>
                    </div>
                    <div className="flex items-center justify-center my-10 ">
                        <div className="stats shadow border w-3/4 h-48">

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



                    {/* cateogirs */}
                    <div className="flex flex-col items-center justify-center mt-20 ">
                        <h1 className="text-4xl text-center font-bold">Top Ctaegories:</h1>
                    </div>
                    <div className="flex items-center justify-center p-10">
                        <Carousel
                            opts={{
                                align: "start",
                            }}
                            className="w-3/4"
                        >
                            <CarouselContent>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/3 h-80 ">
                                        <div className="h-full ">
                                            <Card className=" w-80">
                                                <CardContent className="flex aspect-square items-center justify-center w-full h-full">
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



                    {/* //accordion - q&a */}
                    <div className="flex flex-col items-center justify-center mt-20 ">
                        <h1 className="text-4xl text-center font-bold">Q&A</h1>
                    </div>
                    <div className="flex items-start justify-center max-w-full pb-20">
                        <Accordion type="single" collapsible className="w-1000px">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                                <AccordionContent>
                                    Yes. It adheres to the WAI-ARIA design pattern.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Is it styled?</AccordionTrigger>
                                <AccordionContent>
                                    Yes. It comes with default styles that matches the other
                                    components&apos; aesthetic.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Is it animated?</AccordionTrigger>
                                <AccordionContent>
                                    Yes. It&apos;s animated by default, but you can disable it if you prefer.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                </>}
        </>
    );
};

export default Home;