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
import { TextGenerateEffect } from "../components/ui/text generate/text-generate-effect";
import { words, testimonials, content } from "../services/words.jsx";

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
        const categoryQuizzes = quizzes.filter(quiz => quiz.category === category).slice(0, 5);
        return { category, quizzes: categoryQuizzes };
    });


    useEffect(() => {
        const teachers = users.filter((user) => user.role === "teacher");
        const teachersQuizes = teachers.map((teacher) => {
            return {
                name: teacher.username,
                quizCount: teacher.createdQuizzes ? Object.values(teacher.createdQuizzes).length : 0
            };
        });
        const sorted = teachersQuizes.sort((a, b) => b.quizCount - a.quizCount).slice(0, 4);
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

    const popularQuizzes = quizzes.sort((a, b) => b.finishedCount - a.finishedCount).slice(0, 5);

    const welcoming = `Hi there, ${userData?.firstName}.`;

    return (
        <>
            {userData ?
                <>
                    <div className=" w-full">
                        <div className=" mx-20 ">
                            <div className="flex flex-col mt-12 ">
                                <div className="ml-10">
                                    <div className="flex justify-between w-full ">
                                        <TextGenerateEffect words={welcoming} />
                                        <Input
                                            type="text"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            placeholder="Search content here..."
                                            className="text-start w-96 shadow-custom-light dark:shadow-custom-dark"
                                        />
                                    </div>
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
                                <div className="flex flex-row ">
                                    <div className=" flex flex-col ">
                                        <div id="recent" className="flex flex-col ">
                                            <h1 className="text-2xl ml-10 font-bold text-primary" >
                                                Your Recent Quizzes
                                            </h1>
                                            <div className="border-t-2 border-black-700  mb-5 w-96 ml-10"></div>
                                            <div className="flex flex-row ">
                                                <div id="your-recent" className="ml-10 mr-10 ">
                                                    {userData.role === 'student' ? (
                                                        <div id="student" className="flex flex-row ">
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
                                                        <div id='teacher' className="flex flex-row w-3/4">
                                                            {teacherQuizzes.map((quiz, index) => (
                                                                <ThreeDCardDemo key={index} quiz={quiz} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div id="popular" className="flex flex-col ml-10 mt-10">
                                            <div className="flex mt-15 font-bold" style={{ margin: '-30px 10px' }}>
                                                <div className="flex flex-col">
                                                    <h1 className="text-2xl ">
                                                        Popular
                                                    </h1>
                                                    <div className="border-t-2 border-black-700  mb-5 w-96 "></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-row">
                                                <QuizCardPaginated currentQuiz={popularQuizzes} quizzesPerPage={4} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-20 mx-10 ">
                                    <div className="mb- mt-10 ">
                                        <h2 className="text-center text-3xl  font-bold ">Trending Categories</h2>
                                        <div className="border-t-2 border-black-700  mb-5 w-full  mb-10 mt-5"></div>
                                        {categoriesWithQuizzes.map((categoryWithQuizzes, index) => (
                                            <div key={index} className="mb-20">
                                                <div className="flex flex-col items-start justify-start ">
                                                    <h3 className="ml-10 text-2xl mb-5 font-bold  ">{categoryWithQuizzes.category}</h3>
                                                </div>
                                                <div className="flex flex-row w-full  border-base rounded-md shadow-lg justify-start" >
                                                    <div className=" flex flex-row mx-10">
                                                        {categoryWithQuizzes.quizzes.map((quiz, index) => (
                                                            <ThreeDCardDemo key={index} quiz={quiz} />
                                                        ))}
                                                    </div>
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
                                <div className="flex flex-col items-center justify-center mt-40  ">
                                    <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
                                        The road to quality education stats here
                                    </p>
                                    <TypewriterEffectSmooth words={words} />
                                    <div className="flex flex-col justify-center md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
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


                                            <div className="stat place-items-center bg-white shadow-lg">
                                                <div className="stat-title text-3xl">Users</div>
                                                <div className="stat-value text-secondary">
                                                    <h1 className="text-7xl text-center font-bold">
                                                        <CountUp end={users.length} />
                                                    </h1>
                                                </div>
                                            </div>
                                            <div className="stat place-items-center shadow-lg bg-white">
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
                                <div className="mt-40">
                                    <div className="flex flex-col items-start justify-center ml-40">
                                        <h1 className="text-3xl text-start font-bold ">Evolution of the way we teach and learn</h1>

                                    </div>
                                    <div className="w-2/4 h-1 bg-gradient-to-r from-[#00ff8c] via-[#00ff8c] to-transparent"></div>

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
                                    <div className="flex flex-col items-center justify-center w-600px mb-5 mt-10 ml-20">
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