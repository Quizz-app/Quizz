import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getAllUsers } from "../services/users-service";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { TypewriterEffectSmooth } from "../components/ui/typewriter-effect";
import { useNavigate } from "react-router-dom";
import { Input } from ".././components/ui/input";
import { ThreeDCardDemo } from "../components/ThreeDCardDemo";
import { getQuizByCreator, getTopCategories, getQuizById, getAllQuizzes, listenForCategories } from "../services/quiz-service";
import { getUserQuizzes } from "../services/users-service";
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { AnimatePresence } from "framer-motion";


import { get } from "firebase/database";
import QuizCardPaginated from "../components/QuizCardPaginated";
import { InfiniteMovingCards } from "../components/ui/infinite-moving-cards";
import { StickyScroll } from "../components/ui/sticky-scroll-reveal";
import DummyQuizzes from "../components/DummyQuizzes";

const Home = () => {
    const { userData } = useContext(AppContext);
    const [educatorCount, setEducatorCount] = useState(0);
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [sortedTeachersQuizzes, setSortedTeachersQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherQuizzes, setTeacherQuizzes] = useState([]);
    const [studentQuizzes, setStudentQuizzes] = useState([]);
    const [topCategories, setTopCategories] = useState([]);



    useState(() => {
        listenForCategories(setCategories);
        getAllQuizzes(setQuizzes);
        getAllUsers(setUsers);

    }, [categories, quizzes]);

    useEffect(() => {
        const count = users.reduce((acc, user) => user.role === "teacher" ? acc + 1 : acc, 0);
        setEducatorCount(count);
    }, [users]);



    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };


    const publicQuizzes = quizzes.filter(quiz => quiz.isPublic);

    const searchQuizzes = publicQuizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5);


    useEffect(() => {
        const currentCategories = getTopCategories(quizzes);
        setTopCategories(currentCategories)

    }, [quizzes]);


    const categoriesWithQuizzes = topCategories.map((category) => {
        const categoryQuizzes = quizzes.filter(quiz => quiz.category === category);
        return { category, quizzes: categoryQuizzes };
    });



    const words = [
        {
            text: "Explore",
        },
        {
            text: "the",
        },
        {
            text: "depths",
        },
        {
            text: "of your",
        },
        {
            text: "mind",
        },
        {
            text: "with",
        },
        {
            text: "BrainBurst.",
            className: "text-blue-500 dark:text-lime-500",
        },
    ];


    useEffect(() => {
        const teachers = users.filter((user) => user.role === "teacher");
        const teachersQuizes = teachers.map((teacher) => {
            return {
                name: teacher.username,
                quizCount: teacher.createdQuizzes ? Object.values(teacher.createdQuizzes).length : 0
            };
        });
        const sorted = teachersQuizes.sort((a, b) => b.quizCount - a.quizCount).slice(0, 5);
        setSortedTeachersQuizzes(sorted);
    }, [users]);

    useEffect(() => {
        let unsubscribeQuizByCreator;
        if (userData && (userData.role === 'teacher' || userData.isAdmin === true)) {
            unsubscribeQuizByCreator = getQuizByCreator(userData.username, quizzes => {
                const lastFiveQuizzes = quizzes.slice(-5).reverse();
                setTeacherQuizzes(lastFiveQuizzes);
            });
        }
        const unsubscribeUserQuizzes = getUserQuizzes(userData?.username, async (quizzes) => {
            const quizzesArray = await Promise.all(Object.entries(quizzes).map(async ([id, quiz]) => {
                const fullQuiz = await getQuizById(id);
                return { ...fullQuiz, ...quiz };
            }));
            const completedQuizzes = quizzesArray.filter(quiz => quiz.isCompleted).slice(-5).reverse();
            setStudentQuizzes(completedQuizzes);
        });

        return () => {
            unsubscribeUserQuizzes();
            if (unsubscribeQuizByCreator) {
                unsubscribeQuizByCreator();
            }
        };
    }, [userData]);

    const deleteQuiz = async (id) => {
        try {
            await deleteQuiz(id);
            navigate('/my-library');
        } catch (error) {
            console.error(error);
        }
    }

    const popularQuizzes = quizzes.sort((a, b) => b.finishedCount - a.finishedCount).slice(0, 5);

    const testimonials = [
        {
            quote:
                "As an instructor, I find BrainBurst to be a valuable resource for assessing student understanding and tracking progress. The customizable features make it easy to tailor quizzes to specific topics and learning objectives.",
            name: "Dr. Johnson",
            title: "Mathematics Professor",
        },
        {
            quote:
                "BrainBurst is a lifesaver for busy students like me! With its user-friendly interface and extensive question bank, I can quickly review course material anytime, anywhere.",
            name: "Alex",
            title: "Engineering Student",
        },
        {
            quote:
                "I've integrated BrainBurst into my classroom routine, and the results have been remarkable! Students are more engaged, and their retention of information has significantly improved.",
            name: "Ms. Rodriguez",
            title: "High School Teacher",
        },
        {
            quote:
                "I've tried numerous study aids, but none have been as effective as BrainBurst. It's like having a personal tutor guiding me through complex topics and helping me master challenging concepts.",
            name: "David",
            title: "Physics Student",
        },
        {
            quote:
                "As a teacher, I appreciate how BrainBurst promotes active learning and critical thinking skills. It's a powerful tool for fostering a deeper understanding of course material and encouraging student participation.",
            name: "Mrs. Ivanova",
            title: "Biology Teacher",
        },
        {
            quote:
                "I love it! It's so easy to use and it's really fun. I've been using it for a while now and I've already improved my grades :)",
            name: "Mrs. Williams",
            title: "Geography Teacher",
        },
    ];


    const content = [
        {
            title: "Collaborative Editing",
            description:
                "Work together in real time with your team, clients, and stakeholders. Collaborate on documents, share ideas, and make decisions quickly. With our platform, you can streamline your workflow and increase productivity.",
            content: (
                <DummyQuizzes />
            ),
        },
        {
            title: "Real time changes",
            description:
                "See changes as they happen. With our platform, you can track every modification in real time. No more confusion about the latest version of your project. Say goodbye to the chaos of version control and embrace the simplicity of real-time updates.",
            content: (
                <div className="h-full w-full  flex items-center justify-center text-white">

                </div>
            ),
        },
        {
            title: "Version control",
            description:
                "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
            content: (
                <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
                    Version control
                </div>
            ),
        },
        {
            title: "Running out of content",
            description:
                "Experience real-time updates and never stress about version control again. Our platform ensures that you're always working on the most recent version of your project, eliminating the need for constant manual updates. Stay in the loop, keep your team aligned, and maintain the flow of your work without any interruptions.",
            content: (
                <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
                    Running out of content
                </div>
            ),
        },
    ];

    return (
        <>
            {userData ?
                <>
                <div className="bg-base-200 w-full">
                    <div className=" mx-20 ">
                    <div className="flex flex-col mt-12 ">
                        <div className="flex justify-start w-full mb-5 ml-10">
                            <Input type="text" value={searchTerm} onChange={handleSearchChange}
                                placeholder="Search content here..."
                                className="text-start w-96" />
                        </div>
                        <div className="flex justify-center mb-10">
                            {searchTerm.length > 2 &&
                                <div className="flex flex-col bg-base border rounded-2xl mb-5">
                                    <div className="flex flex-row justify-center">
                                        <h1 className="mt-5 text-2xl ml-5 mr-5">
                                            Search results
                                        </h1>
                                    </div>
                                    <div className="flex flex-row ml-5">
                                        {searchTerm.length > 2 &&
                                            searchQuizzes
                                                .filter(quiz => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((quiz, index) => (
                                                    <ThreeDCardDemo key={index} quiz={quiz} />
                                                ))}
                                    </div>
                                    {searchQuizzes.filter(quiz => quiz.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 &&
                                        <div className="flex justify-center mt-5 mb-5">
                                            <h2 className=" text-2xl ml-5 mr-5">{`No results found. Sorry :(`}</h2>
                                        </div>
                                    }
                                </div>}
                        </div>
                        <div className="flex flex-row w-full">
                            <div className=" flex flex-col w-full">
                                <div id="recent" className="flex flex-col">
                                    <h1 className=" text-2xl ml-10 my-10" style={{ margin: "0px 45px 30px 45px" }}>
                                        Your Recent Quizzes
                                    </h1>
                                    <div className="flex flex-row w-full justify-between">
                                        <div id="your-recent" className="ml-10">
                                            {userData.role === 'student' ? (
                                                <div id="student" className="flex flex-row overflow-auto">
                                                    {studentQuizzes && studentQuizzes.length > 0 ? (
                                                        studentQuizzes.map((quiz, index) => (
                                                            <ThreeDCardDemo key={index} quiz={quiz} isCompleted={true} />
                                                        ))
                                                    ) :
                                                        (
                                                            <div className="flex flex-row justify-center">
                                                                <p className="text-2xl">No Quiz Contributions Yet</p>
                                                            </div>
                                                        )}
                                                </div>
                                            ) : (
                                                <div id='teacher' className="flex flex-row overflow-auto">
                                                    {teacherQuizzes.map((quiz, index) => (
                                                        <ThreeDCardDemo key={index} quiz={quiz} onButtonClick={() => deleteQuiz(quiz.id)} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div id="table" className="mr-10">
                                            <h1 className="text-2xl">
                                                Our Top 5 Quizcrafters
                                            </h1>
                                            <div className="border-t-2 border-gray mb-5"></div>
                                            <div className="overflow-x-auto">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th></th>
                                                            <th>Teacher</th>
                                                            <th>Created Quizzes</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {sortedTeachersQuizzes.map((teacher, index) => (
                                                            <tr key={index}>
                                                                <th>{index + 1}</th>
                                                                <td>{teacher.name}</td>
                                                                <td>{teacher.quizCount}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div id="popular" className="flex flex-col  justify-start w-full ml-10">
                                    <div className="flex mt-15" style={{ margin: '-30px 10px' }}>
                                        <h1 className="text-2xl">
                                            Popular
                                        </h1>
                                    </div>
                                    <div className="flex flex-row">
                                        <QuizCardPaginated currentQuiz={popularQuizzes} quizzesPerPage={5} deleteQuiz={deleteQuiz} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div>
                                <h2 className="text-center text-3xl mr-5 mb-10">Trending Categories</h2>
                                {categoriesWithQuizzes.map((categoryWithQuizzes, index) => (
                                    <div key={index}>
                                        <h3 className="ml-10 text-2xl">{categoryWithQuizzes.category}</h3>
                                        <div className="flex flex-row justify-start w-full ml-10" style={{ margin: '-30px 30px' }}>
                                            {categoryWithQuizzes.quizzes.map((quiz, index) => (
                                                <ThreeDCardDemo key={index} quiz={quiz} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    </div>
                </div>
                </>
                :
                <>

                    <AnimatePresence mode='wait'>
                        <motion.div
                            initial={{ opacity: 0, x: -200 }} // Starts from the left
                            animate={{ opacity: 1, x: 0 }} // Moves to the center
                            exit={{ opacity: 0, x: 200 }} // Exits to the right
                            transition={{ duration: 0.99 }}
                        >

                            <div>
                                <div className="flex flex-col items-center justify-center mt-20 ">
                                    <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
                                        The road to quality education stats here
                                    </p>
                                    <TypewriterEffectSmooth words={words} />
                                    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
                                        <motion.button
                                            onClick={() => navigate("/register")}
                                            className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(0,118,255,0.9)] px-8 py-2 bg-[#0070f3] rounded-md text-white font-light transition duration-200 ease-linear"
                                            initial={{ scale: 2 }}
                                            animate={{ scale: [1, 1.05, 1.4] }}
                                            transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                                        >
                                            Join Now
                                        </motion.button>

                                    </div>
                                </div>
                                {/* //hero */}
                                <div>
                                    <div className="flex flex-col items-center justify-center mt-20 ">
                                        <h1 className="text-3xl text-start font-bold">Become a Master Genius and Get Brainburst!</h1>
                                    </div>
                                    <div className="flex items-center justify-center my-10 ">
                                        <div className="stats shadow  w-3/4 h-48">


                                            <div className="stat place-items-center">
                                                <div className="stat-title text-3xl">Users</div>
                                                <div className="stat-value text-secondary">
                                                    <h1 className="text-7xl text-center font-bold">
                                                        <CountUp end={users.length} />
                                                    </h1>
                                                </div>
                                            </div>

                                            <div className="stat place-items-center">
                                                <div className="stat-title text-3xl">Educators</div>
                                                <div className="stat-value">
                                                    <h1 className="text-7xl text-center font-bold">
                                                        <CountUp end={educatorCount} />
                                                    </h1>
                                                </div>
                                            </div>




                                        </div>
                                    </div>
                                </div>
                                {/* cateogirs */}
                                {/* <div>
                            <div className="flex flex-col items-center justify-center mt-20 ">
                                <h1 className="text-4xl text-center font-bold">Top Categories:</h1>
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
                        </div> */}

                                <div className="mt-40 ">
                                    <div className="flex flex-col items-start justify-center ml-40">
                                        <h1 className="text-3xl text-start font-bold ">Evolution of the way we teach and learn</h1>

                                    </div>
                                    <div className="border-t-2 border-neon-green mb-5 w-2/4"></div>

                                    <div className="p-10">
                                        <StickyScroll content={content} />
                                    </div>
                                </div>



                                <div className="h-[30rem] rounded-md flex flex-col antialiased  dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden mt-10">
                                    <InfiniteMovingCards
                                        items={testimonials}
                                        direction="right"
                                        speed="slow"
                                    />
                                </div>


                                {/* //accordion - q&a */}
                                <div>
                                    <div className="flex flex-col items-center justify-center w-600px mb-5 mt-10">
                                        <h1 className="text-4xl text-start font-bold">Q&A</h1>
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
                                </div>

                            </div>
                        </motion.div>
                    </AnimatePresence>

                </>}
        </>
    );
};

export default Home;