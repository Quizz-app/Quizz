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
import { get } from "firebase/database";
import QuizCardPaginated from "../components/QuizCardPaginated";

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
            className: "text-lime-500 dark:text-lime-500",
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

    return (
        <>
            {userData ?
                (
                    <div className="flex flex-col">
                        <div className="flex justify-center w-full mb-5">
                            <Input type="text" value={searchTerm} onChange={handleSearchChange}
                                placeholder="Search quizzes..."
                                className="text-center" />
                        </div>
                        <div className="flex justify-center mb-10">
                            {searchTerm.length > 2 &&
                                <div className="flex flex-col bg-base-200 border rounded-2xl mb-5">
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
                                            <h2 className=" text-2xl ml-5 mr-5">No results found. Sorry :(</h2>
                                        </div>
                                    }
                                </div>}
                        </div>
                        <div className="flex flex-row w-full">
                            <div className=" flex flex-col w-full">
                                <div id="recent" className="flex flex-col">
                                    <div className="flex flex-row w-full justify-between">
                                        <div id="your-recent" className="ml-10">
                                            <h1 className="text-2xl">
                                                Your Recent Quizzes
                                            </h1>
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
                )
                :
                <>
                    <div className="flex flex-col items-center justify-center  ">
                        <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
                            The road to quality education stats here
                        </p>
                        <TypewriterEffectSmooth words={words} />
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
                            <button onClick={() => navigate("/register")} className="w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm">
                                Join now
                            </button>
                        </div>
                    </div>
                    {/* //hero */}
                    <div>
                        <div className="flex flex-col items-center justify-center mt-20 ">
                            <h1 className="text-4xl text-center font-bold">Become a Master Genius and Get Brainburst!</h1>
                        </div>
                        <div className="flex items-center justify-center my-10 ">
                            <div className="stats shadow border w-3/4 h-48">

                                <div className="stat place-items-center">
                                    <div className="stat-title">Users</div>
                                    <div className="stat-value text-secondary">{users.length}</div>
                                    <div className="stat-desc text-secondary">↗︎ 54%</div>
                                </div>

                                <div className="stat place-items-center">
                                    <div className="stat-title">Educators</div>
                                    <div className="stat-value">{educatorCount}</div>
                                    <div className="stat-desc text-secondary">↗︎ 67%</div>
                                </div>

                            </div>
                        </div>
                    </div>
                    {/* cateogirs */}
                    <div>
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
                    </div>
                    {/* //accordion - q&a */}
                    <div>
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
                    </div>
                    {/* //footer */}
                    <footer className="footer p-10 bg-base-200 text-base-content">
                        <aside>
                            <svg width="50" height="50" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" className="fill-current"><path d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z"></path></svg>
                            <p>ACME Industries Ltd.<br />Providing reliable tech since 1992</p>
                        </aside>
                        <nav>
                            <h6 className="footer-title">Services</h6>
                            <a className="link link-hover">Branding</a>
                            <a className="link link-hover">Design</a>
                            <a className="link link-hover">Marketing</a>
                            <a className="link link-hover">Advertisement</a>
                        </nav>
                        <nav>
                            <h6 className="footer-title">Company</h6>
                            <a className="link link-hover">About us</a>
                            <a className="link link-hover">Contact</a>
                            <a className="link link-hover">Jobs</a>
                            <a className="link link-hover">Press kit</a>
                        </nav>
                        <nav>
                            <h6 className="footer-title">Legal</h6>
                            <a className="link link-hover">Terms of use</a>
                            <a className="link link-hover">Privacy policy</a>
                            <a className="link link-hover">Cookie policy</a>
                        </nav>
                    </footer>
                </>}
        </>
    );
};

export default Home;