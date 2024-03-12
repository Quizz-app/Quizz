import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { getUserClasses, userQuizzesCreated, userQuizzesMostOccurringGrade, userQuizzesSolved } from "../services/users-service";
import { useState } from "react";
import BarChart from "../components/barChart";
import { BackgroundGradient } from "../components/ui/background-gradient";
import { getClassById, getClassMemebersByRanking } from "../services/class-service";
import { set } from "firebase/database";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";


const Dashboard = () => {
    const { userData } = useContext(AppContext);
    const [quizzesSolved, setQuizzesSolved] = useState(0);
    const [quizzesCreated, setQuizzesCreated] = useState(0);
    const [quizzesGrades, setQuizzesGrades] = useState([]);
    const [classes, setClasses] = useState([]);
    const [clasz, setClas] = useState(null);
    const [open, setOpen] = useState(false);
    const [id, setId] = useState('');
    const [rankedMembers, setRankedMembers] = useState([]);

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
                    setQuizzesCreated(quizzesCreated);
                }
            } catch (error) {
                console.log(error);
            }
        })();
    }, [userData]);

   
        useEffect(() => {
            (async () => {
                if (id || (classes && classes[0])) {
                    const classMembers = await getClassMemebersByRanking(id || classes[0].id);
                    setRankedMembers(classMembers);
              
                }
            })();
        }, [id, classes]);
          console.log(rankedMembers);
    const currentUserPosition = rankedMembers.findIndex(member => member.username === userData.username) + 1;
    console.log(currentUserPosition);

    const classOptions = classes.map((clasz) => {
        return { label: clasz.name, value: clasz.id };
    });

    return (
        <div className="flex flex-col h-full items-start justify-start p-6">
            <h1>Dashboard</h1>
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

                        <div className="stats shadow border round-md">
                            <div className="stat">
                                <div className="stat-title">Users solved:</div>
                                <div className="stat-value">0</div>
                                <div className="stat-title">of your quizzes</div>
                            </div>
                        </div>

                        {/* last 20 solvings only for now */}
                        <div className="stats shadow border round-md">
                            <div className="stat">
                                <div className="stat-title">Average grade</div>
                                <div className="stat-value">Satisfactory</div>
                                <div className="stat-title">received on your quizzes</div>
                            </div>
                        </div>

                    </div>
                </>)
                :
                (<>
                    {/* student dashboard */}
                    <div className="flex flex-row h-full items-center justify-between ">
                        <div className="stats shadow border round-md">
                            <div className="stat">
                                <div className="stat-title">Quizzes solved:</div>
                                <div className="stat-value">{quizzesSolved}</div>
                                <div className="stat-title">21% more than last month</div>
                            </div>
                        </div>

                        <div className="stats shadow border round-md">
                            <div className="stat">
                                <div className="stat-title">Overall grade</div>
                                <div className="stat-value">{quizzesGrades}</div>
                                <div className="stat-title">21% more than last month</div>
                            </div>
                        </div>

                        <div className="stats shadow border round-md">
                            <div className="stat">
                                <div className="stat-title">Place</div>
                                <div className="stat-value">{currentUserPosition ? `${currentUserPosition}th` : 'Not ranked'}</div>
                                <div className="stat-title">in class </div>
                            </div>
                        </div>
                    </div>
                </>)}

            {/* table */}
            {userData && (userData.role === 'teacher' || userData.isAdmin === true)
                ?
                (<BarChart data={experimentalData} />)
                :
                (<BarChart data={experimentalData} />)}


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

    );
};

export default Dashboard; 