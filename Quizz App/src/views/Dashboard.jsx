import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import {
    getUserClasses, getUserCreatedQuizzes,
    getUsersRankedByScoreOnAQuiz, mostReceivedGradeOnQuizzesByCreator,
    scheduleUserQuizzesScoreAveragePerWeek, userQuizzesCreated,
    userQuizzesMostOccurringGrade, userQuizzesSolved
} from "../services/users-service";
import { useState } from "react";
import BarChart from "../components/barChart";
import { getClassMemebersByRanking } from "../services/class-service";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import RankingTable from "../components/RankingTable";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area"


const Dashboard = () => {
    const { userData } = useContext(AppContext);
    const [quizzesSolved, setQuizzesSolved] = useState(0);
    const [quizzesCreated, setQuizzesCreated] = useState(0);
    const [quizzesGrades, setQuizzesGrades] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [rankedMembers, setRankedMembers] = useState([]);
    const [weeklyScoreData, setWeeklyScoreData] = useState([]);
    const [mostOccuringGrad, setMostOccuringGrade] = useState(null);
    const [classes, setClasses] = useState([]);
    const [clasz, setClas] = useState('');
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [quizId, setQuizId] = useState('');
    const [quizS, setQuiz] = useState('');
    const [rankedQuizSolvers, setRankedQuizSolvers] = useState([]);


    const experimentalData = [36, 78, 56, 78];

    useEffect(() => {
        (async () => {
            try {
                if (userData && userData.username && userData.role === 'student') {
                    const quizzesSolved = await userQuizzesSolved(userData.username);
                    const overallGrade = await userQuizzesMostOccurringGrade(userData.username);
                    setQuizzesSolved(quizzesSolved);
                    setQuizzesGrades(overallGrade || []);

                    await getUserClasses(userData.username, setClasses);

                } else if (userData && userData.username) {
                    const quizzesCreated = await userQuizzesCreated(userData.username);
                    const mostOccuringGrade = await mostReceivedGradeOnQuizzesByCreator(userData.username);

                    getUserCreatedQuizzes(userData.username, setQuizzes);

                    setQuizzesCreated(quizzesCreated);
                    setMostOccuringGrade(mostOccuringGrade);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [userData]);

    useEffect(() => {
        (async () => {
            if (quizId || (quizzes && quizzes[0])) {
                const users = await getUsersRankedByScoreOnAQuiz(quizId || quizzes[0].id);
                setRankedQuizSolvers(users);
               
            }
        })();
    }, [quizId, quizzes]);


    useEffect(() => {
        (async () => {
            if (id || (classes && classes[0]) && userData && userData.role === 'student') {
                console.log(classes[0].id)
                const classMembers = await getClassMemebersByRanking(id || classes[0].id);
                console.log(classMembers);
                setRankedMembers(classMembers);


            }
        })();
    }, [id, classes]);

    // Fetch the data immediately when the component mounts
    useEffect(() => {
        if (userData && userData.username && userData.role === 'student') {
            //console.log('i am run');
            scheduleUserQuizzesScoreAveragePerWeek(userData.username)
                .then(data => {
                    setWeeklyScoreData([data]);
                });
        }
    }, [userData]); // Add userData to the dependency array

    useEffect(() => {
        const fetchData = async () => {
            if (userData && userData.username && userData.role === 'student') {
                const data = await scheduleUserQuizzesScoreAveragePerWeek(userData.username);

                // If the array length is 4, reset the array
                if (weeklyScoreData.length === 4) {
                    setWeeklyScoreData([data]);
                } else {
                    setWeeklyScoreData((prevData) => [...prevData, data]);
                }

                // Store the time of the last fetch in localStorage
                localStorage.setItem('lastFetchTime', Date.now().toString());
            }
        };

        // Calculate the time remaining until the next fetch
        const lastFetchTime = Number(localStorage.getItem('lastFetchTime'));
        const timeSinceLastFetch = Date.now() - lastFetchTime;
        const timeUntilNextFetch = Math.max(0, 1000 * 60 * 60 * 24 * 7 - timeSinceLastFetch);

        const intervalId = setInterval(fetchData, timeUntilNextFetch);

        // Clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, [userData, weeklyScoreData]); // Re-run the effect if userData or weeklyScoreData changes


    const currentUserPosition = rankedMembers.findIndex(member => member.username === userData.username) + 1;

    const quizOptions = quizzes.map((quiz) => { return { label: quiz.title, value: quiz.id }; });

    const classOptions = classes.map((clasz) => {
        return { label: clasz.name, value: clasz.id };
    });

    // console.log(rankedQuizSolvers);
    return (

        <AnimatePresence mode='wait'>
            <motion.div
                initial={{ opacity: 0, x: -200 }} // Starts from the left
                animate={{ opacity: 1, x: 0 }} // Moves to the center
                exit={{ opacity: 0, x: 200 }} // Exits to the right
                transition={{ duration: 0.9 }}
            >
                <div className="flex flex-col h-full items-center justify-center mt-10">
                    <h1 className="mb-10 text-xl">Dashboard</h1>
                    {userData && (userData.role === 'teacher' || userData.isAdmin === true) ?
                        (<>
                            {/* teacher dashboard */}
                            <div className="flex flex-row h-full items-center justify-between ">
                                <div className="stats shadow border round-md">
                                    <div className="stat">
                                        <div className="stat-title">Quizzes created:</div>
                                        <div className="stat-value">{quizzesCreated}</div>
                                        <div className="stat-title">21% more than last month</div>
                                    </div>
                                </div>


                                {/* last 20 solvings only for now */}
                                <div className="stats shadow border round-md">
                                    <div className="stat">
                                        <div className="stat-title">Average grade</div>
                                        <div className="stat-value">{mostOccuringGrad}</div>
                                        <div className="stat-title">received on your quizzes</div>
                                    </div>
                                </div>

                            </div>
                        </>)
                        :
                        (<>
                            {/* student dashboard */}
                            <div className="flex flex-row h-full items-center justify-between mb-10">
                                <div className="stats shadow border-4 round-md w-96 h-40">
                                    <div className="stat">
                                        <div className="stat-title">Quizzes solved:</div>
                                        <div className="stat-value">{quizzesSolved}</div>
                                        <div className="stat-title">overall</div>
                                    </div>
                                </div>

                                <div className="stats shadow border-4 round-md ml-20 w-96 h-40">
                                    <div className="stat">
                                        <div className="stat-title">Average grade</div>
                                        <div className="stat-value">{quizzesGrades}</div>
                                        <div className="stat-title">received on quizzes</div>
                                    </div>
                                </div>

                                <div className="stats shadow border-4 round-md ml-20 w-96 h-40">
                                    <div className="stat">
                                        <div className="stat-title">Place</div>
                                        <div className="stat-value">{currentUserPosition ? `${currentUserPosition}th` : 'Not ranked'}</div>
                                        <div className="stat-title">in class </div>
                                    </div>
                                </div>
                            </div>
                        </>)}

                    {/* table */}
                    {userData && (userData.role === 'student') && (

                        <div className="flex flex-row h-full items-start justify-between mb-10">
                            <div>
                                <BarChart data={weeklyScoreData} />
                            </div>

                            <div className="flex flex-col h-full items-start justify-between ml-10">
                                <div className="flex flex-row h-full items-start justify-between mb-5">
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={open}
                                                className="w-[200px] justify-between"
                                            >
                                                {clasz
                                                    ? classOptions.find((framework) => framework.value === clasz)?.label
                                                    : "Choose a class"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <Command>
                                                {/* <CommandInput placeholder="Search framework..." /> */}
                                                <CommandEmpty>No class selected</CommandEmpty>
                                                <CommandGroup>
                                                    {classOptions.map((clas, index) => (
                                                        <CommandItem
                                                            key={index}
                                                            value={clas.value}
                                                            onSelect={async (currentValue) => {
                                                                // console.log(currentValue);
                                                                // console.log(clas.value);
                                                                setClas(clas.value);
                                                                setId(clas.value);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-5 w-4",
                                                                    clasz === clas.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {clas.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* <table className="ml-10">
                                    {rankedMembers.length > 0 &&
                                        rankedMembers.map((member, index) => {
                                            return <RankingTable key={index} student={member} index={index + 1} />
                                        })}
                                </table> */}

                                <div className="">
                                    <ScrollArea className="flex flex-grow h-[380px] w-[500px] rounded-xl border p-4 justify-center items-center">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Avatar</th>
                                                    <th>Student</th>
                                                    <th>Full Name</th>
                                                    <th>Class rank</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rankedMembers.map((student, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-12 h-12">
                                                                    <img src={student?.avatar} />
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{student?.username}</td>
                                                        <td>{`${student?.firstName} ${student?.lastName}`}</td>

                                                        {index === 0 && <th>{index + 1} <span className="text-2xl">👑</span></th>}
                                                        {index === 1 && <th>{index + 1} <span className="text-2xl">🏆</span></th>}
                                                        {index === 2 && <th>{index + 1} <span className="text-2xl">🥉</span></th>}

                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    )}
                    {userData && (userData.role === 'teacher') &&
                        (<Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[200px] justify-between"
                                >
                                    {quizS
                                        ? quizOptions.find((framework) => framework.value === quizS)?.label
                                        : "Choose a quizz"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0">
                                <Command>
                                    {/* <CommandInput placeholder="Search framework..." /> */}
                                    <CommandEmpty>No class selected</CommandEmpty>
                                    <CommandGroup>
                                        {quizOptions.map((quiz, index) => (
                                            <CommandItem
                                                key={index}
                                                value={quiz.value}
                                                onSelect={async (currentValue) => {
                                                    // console.log(currentValue);
                                                    // console.log(clas.value);
                                                    setQuiz(quiz.value);
                                                    setQuizId(quiz.value);
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-5 w-4",
                                                        quizS === quiz.value ? "opacity-100" : "opacity-0"
                                                    )} />
                                                {quiz.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        )}

            
                    <table>
                        {rankedQuizSolvers.length > 0 &&
                            rankedQuizSolvers.map((member, index) => {
                                if (member.quizzes[quizId]) {
                                    return <RankingTable key={index} student={member} score={member.quizzes[quizId].score} />;
                                } else {
                                    return null;
                                }
                            })}
                    </table>

                    {/* 
            <div>
                <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10 bg-white dark:bg-zinc-900"> */}
                    {/* <Image
                        src={`/jordans.webp`}
                        alt="jordans"
                        height="400"
                        width="400"
                        className="object-contain"
                    /> */}
                    {/* <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                        Air Jordan 4 Retro Reimagined
                    </p>

                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        The Air Jordan 4 Retro Reimagined Bred will release on Saturday,
                        February 17, 2024. Your best opportunity to get these right now is by
                        entering raffles and waiting for the official releases.
                    </p>
                    <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
                        <span>Buy now </span>
                        <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                            $100
                        </span>
                    </button>
                </BackgroundGradient>
            </div> */}

                </div>

            </motion.div>
        </AnimatePresence>

    );
};

export default Dashboard; 