import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { addQuizToClass, addQuizToTeam, deleteQuizById, getQuizById, inviteUserToQuiz, observeQuiz, setEndOn, setOnGoing, updateQuiz, } from "../services/quiz-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, listenForQuestions, updateQuestion } from "../services/questions-service";
import QuestionCard from "./QuestionCard";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandGroup, CommandItem, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { getAllStudents, getUserClasses, getUserTeams } from "../services/users-service";
import { toast } from "react-hot-toast";
import { formatDate, msToTime, timeRanges } from "../services/time-functions";
import Assistant from "../components/Assistant";
import { DatePickerDemo } from "../components/DatePicker";
import { AiOutlineTeam } from "react-icons/ai";
import { MdCancel, MdDoneAll, MdDownloadDone } from "react-icons/md";
import { PiStudent } from "react-icons/pi";
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from 'framer-motion';
import TableWithPagination from "../components/TableWithPagination";

const CreateQuiz = () => {
    const { id } = useParams();
    const [date, setDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");
    const [quiz, setQuiz] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState(["", ""]);
    const [createMode, setCreateMode] = useState(false);
    const [correctAnswerIndices, setCorrectAnswerIndices] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [totalPoints, setTotalPoints] = useState(0);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshQuestions, setRefreshQuestions] = useState(false);
    const [open, setOpen] = useState(false);
    const [timeLimit, setTimeLimit] = useState(0);
    const [userTeams, setUserTeams] = useState([]);
    const [userClasses, setUserClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();
    const [grades, setGrades] = useState({
        good: 0,
        bad: 0,
    });
    const { userData } = useContext(AppContext)
    const [question, setQuestion] = useState({
        content: "",
        answers,
        points: 0
    });

    const [openPanel, setOpenPanel] = useState(null);

    const handleButtonClick = (panel) => {
        if (openPanel === panel) {
            setOpenPanel(null);
        } else {
            setOpenPanel(panel);
        }
    };

    //USE EFFECTS DO NOT TOUCH AT ANY COST
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const fetchedQuiz = await getQuizById(id);

                if (JSON.stringify(fetchedQuiz) !== JSON.stringify(quiz)) {
                    setQuiz(fetchedQuiz);
                    setTimeLimit(fetchedQuiz.quizTime || 0);
                    setGrades(fetchedQuiz.grades || { good: 0, bad: 0 });
                    setDescription(fetchedQuiz.description || "");
                    setLoading(false);
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [id]);

    useEffect(() => {
        const unsubscribe = listenForQuestions(id, (fetchedQuestions) => {
            try {
                setLoading(true);
                if (JSON.stringify(fetchedQuestions) !== JSON.stringify(questions)) {
                    setQuestions(fetchedQuestions);


                    const newTotalPoints = fetchedQuestions.reduce(
                        (total, question) => total + Number(question.points),
                        0
                    );
                    if (newTotalPoints !== totalPoints) {
                        setTotalPoints(newTotalPoints);
                    }
                }
                setLoading(false);
            } catch (error) {
                if (error.message === "No questions found") {
                    setQuestions([]);
                } else {
                    throw error;
                }
            }
        });

        return () => unsubscribe();
    }, [id, refreshQuestions]);

    //USE EFFECTS FOR THE TEAMS
    useEffect(() => {
        getUserTeams(userData?.username, setUserTeams);
    }, [userData]);

    useEffect(() => {
        getUserClasses(userData?.username, setUserClasses);
    }, [userData]);

    const filteredClasses = userClasses.filter(
        (classes) => classes.members[userData?.username]
    );

    //Filter the user teams to get the teams the user is a member of
    const filteredTeams = userTeams.filter(
        (team) => team.members[userData?.username]
    );
    //Set the students
    useEffect(() => {
        setLoading(true);
        getAllStudents().then(setStudents);
        setLoading(false);
    }, []);
    const filteredStudents = students.filter((student) =>
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //Handle the click event to add the quiz to the team
    const handleAddQuizToTeam = async (teamId) => {
        addQuizToTeam(teamId, id);
    };

    const handleAddQuizToClass = async (classId) => {
        addQuizToClass(classId, id);
    }

    const handleAddQuizToStudent = async (studentId) => {
        inviteUserToQuiz(id, studentId, userData.username);
    };

    // Checking for empty answers in a question
    const emptyAnswer = answers.some((answer) => answer === "");

    //ASYNCHRONOUS FUNCTIONS DO NOT TOUCH AT ANY COST
    const handleAddQuestion = async () => {
        if (emptyAnswer) {
            return toast.error("Please provide an answer.");
        }

        if (!question.content) {
            return toast.error("Please enter a question.");
        }

        if (question.content.length > 100) {
            return toast.error("Your question is too long!");
        }

        try {
            await addQuestion(
                quiz.id,
                question.content,
                question.answers,
                question.points,
                correctAnswerIndices
            );

            setCreateMode(false);
            setRefreshQuestions((prev) => !prev);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateQuestion = async (updatedQuestion) => {
        try {
            console.log(updatedQuestion);
            await updateQuestion(
                quiz.id,
                updatedQuestion.id,
                updatedQuestion.content,
                updatedQuestion.answers,
                updatedQuestion.points,
                updatedQuestion.correctAnswer
            );

            setRefreshQuestions((prev) => !prev);
            setEditingQuestion(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        try {
            await deleteQuestion(quiz.id, questionId);
            setRefreshQuestions((prev) => !prev);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSetDescription = async () => {
        if (description.length > 35) {
            console.error("Description should not be more than 35 characters");
            return;
        }
        const updatedQuiz = { ...quiz, description };
        try {
            await updateQuiz(id, updatedQuiz);
            setQuiz(updatedQuiz);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSetTime = async (time) => {
        const updatedQuiz = { ...quiz, quizTime: Number(time) };
        try {
            await updateQuiz(id, updatedQuiz);
            setQuiz(updatedQuiz);
        } catch (error) {
            console.error(error);
        }
    };



    const handleQuestionChange = (e) => {
        setQuestion({ ...question, content: e.target.value });
    };

    const handleAnswerChange = (index) => (e) => {
        const newAnswers = [...answers];
        newAnswers[index] = e.target.value;
        setAnswers(newAnswers);
        setQuestion({ ...question, answers: newAnswers });
    };

    const handlePointsChange = (e) => {
        setQuestion({ ...question, points: Number(e.target.value) });
    };

    const handleAddAnswer = () => {
        setAnswers([...answers, ""]);
    };

    const questionCreation = () => {
        setCreateMode(true);
    };

    const handleCheckboxChange = (index) => {
        if (correctAnswerIndices.includes(index)) {
            setCorrectAnswerIndices(correctAnswerIndices.filter((i) => i !== index));
        } else {
            setCorrectAnswerIndices([...correctAnswerIndices, index]);
        }
    };

    const handleRemoveAnswer = (index) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);
        setCorrectAnswerIndices(correctAnswerIndices.filter((i) => i !== index));
    };

    const [remainingTime, setRemainingTime] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const newRemainingTime = new Date(quiz?.endsOn).getTime() - new Date().getTime();
            setRemainingTime(newRemainingTime);

            if (newRemainingTime <= 0) {
                clearInterval(timer);
                setOnGoing(id);

            }
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, id]);


    useEffect(() => {
        observeQuiz(id, setQuiz);
    }
        , [id]);


    const handleSaveQuiz = async (time, grades, endsOn) => {
        if (grades.good !== 0 || grades.bad !== 0) {
            const updatedQuiz = { ...quiz, quizTime: Number(time), grades };
            try {
                await updateQuiz(id, updatedQuiz);
                await setEndOn(id, endsOn);
                setQuiz({ ...updatedQuiz, endsOn });
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleDeleteQuiz = async () => {
        await deleteQuizById(id);
        navigate("/my-library");
    };

    return (
        <>

            <div className="flex flex-row items-center justify-between">
                {/* quiz title */}
                <div className="mb-2">
                    <h1 className="text-4xl font-bold mb-4">{quiz?.title}</h1>
                    {userData?.username !== quiz?.creator && <h1>Created by: {quiz?.creator}</h1>}
                </div>
                {/* action buttons */}
                <div className="flex flex-row items-center justify-center">
                    <div className="flex flex-col items-center justify-center">

                        <Button onClick={() => handleButtonClick('assignTeam')}> <AiOutlineTeam />   Assign to group</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">

                        <Button onClick={() => handleButtonClick('assignClass')}> <AiOutlineTeam />   Assign to class</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={() => handleButtonClick('assignUser')}> <PiStudent /> Assign to student</Button>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={() => navigate("/my-library")}> <MdDoneAll /> Back to library</Button>
                    </div>

                </div>

            </div>
            {/* THIS IS THE GRAY LINE*/}
            <div className="border-t-2 border-gray-200 mb-3"></div>
            {/* Here we can see all the teams that the current user is in*/}
            {openPanel === 'assignTeam' && filteredTeams.length > 0 && (
                <div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} // Starts smaller and invisible
                        animate={{ opacity: 1, scale: 1 }} // Scales up to its original size and becomes visible
                        exit={{ opacity: 0, scale: 0.8 }} // Scales down and becomes invisible
                        transition={{ duration: 0.5 }} // The duration of the transition
                    >
                        <h1 className="text-xl mb-5 mt-3">Teams you participate in</h1>
                        <table className="table mb-10">
                            <thead>
                                <tr>
                                    <th>Team Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTeams.map((team) =>
                                    <tr key={team.id}>
                                        <td>{team.name}</td>
                                        <td>
                                            <button onClick={() => handleAddQuizToTeam(team.id)} className="btn btn-xs mb-1">Add quiz to team</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            )}
            {openPanel === 'assignClass' && filteredClasses.length > 0 && (
                <div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} // Starts smaller and invisible
                        animate={{ opacity: 1, scale: 1 }} // Scales up to its original size and becomes visible
                        exit={{ opacity: 0, scale: 0.8 }} // Scales down and becomes invisible
                        transition={{ duration: 0.5 }} // The duration of the transition
                    >
                        <h1 className="text-xl mb-5 mt-3">Classes you participate in</h1>
                        <table className="table mb-10">
                            <thead>
                                <tr>
                                    <th>Class Name</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((classes) =>
                                    <tr key={classes.id}>
                                        <td>{classes.name}</td>
                                        <td>
                                            <button onClick={() => handleAddQuizToClass(classes.id)} className="btn btn-xs mb-1">Add quiz to class</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                </div>
            )}

            {/* Here we can see all the students that are in the system*/}
            {openPanel === 'assignUser' && students.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} // Starts smaller and invisible
                    animate={{ opacity: 1, scale: 1 }} // Scales up to its original size and becomes visible
                    exit={{ opacity: 0, scale: 0.8 }} // Scales down and becomes invisible
                    transition={{ duration: 0.5 }} // The duration of the transition
                >
                    <div className="flex flex-col mb-10">
                        <div className="w-96 justify">
                            <Input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for student" />
                        </div>
                        <div className="flex flex-col">

                            <div className="flex justify-center">
                                <h1 className="text-xl mb-5 mt-3">Results</h1>
                            </div>
                            <div id="student-table">
                                {searchTerm.length >= 3 &&
                                    <div className="overflow-x-auto">

                                        {searchTerm.length > 0 && searchTerm ? (
                                            <TableWithPagination array={filteredStudents} pages={5} addMember={handleAddQuizToStudent} buttonText={'Send to student'} />
                                        ) : (
                                            <div className="flex justify-center mt-5 mb-5">
                                                <h2 className=" text-2xl ml-5 mr-5">{`No results found. Sorry :(`}</h2>
                                            </div>
                                        )}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            <div className="flex flex-row items-center justify-between mb-3">
                <div id="questions-score">
                    <h1 className="text-xl mb-2 mt-3">Total question points: {totalPoints}</h1>
                </div>

                <div className="flex flex-row items-center justify-center">
                    <motion.button
                        onClick={questionCreation}
                        className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-white font-light transition duration-200 ease-linear "
                        initial={{ scale: 2 }}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                    >
                        Add Question +
                    </motion.button>
                    <button onClick={() => handleButtonClick('assignAssistant')} className="relative inline-flex h-10 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 ml-3">
                        <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white px-3 py-1 text-sm font-medium text-slate-950 backdrop-blur-3xl">
                            Use Assistant ✨
                        </span>
                    </button>
                </div>
            </div>
            {/* THIS IS THE GRAY LINE*/}
            <div className="border-t-2 border-gray-200 mt-2 mb-2"></div>

            <div className='flex justify-center items-center'>
                {openPanel === 'assignAssistant' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }} // Starts smaller and invisible
                        animate={{ opacity: 1, scale: 1 }} // Scales up to its original size and becomes visible
                        exit={{ opacity: 0, scale: 0.8 }} // Scales down and becomes invisible
                        transition={{ duration: 0.5 }} // The duration of the transition
                    >
                        <ScrollArea className="flex flex-grow h-[300px] w-[1350px] rounded-xl border p-4 justify-center items-center">
                            <Assistant quiz={quiz} questions={questions} />
                        </ScrollArea>
                    </motion.div>
                )}
            </div>
            <div className="flex flex-col justify-between">
                <div className="flex flex-row ">
                    <div id='questions-cards' className="grid grid-cols-3 w-800px mr-5">
                        {questions ? (
                            questions.map((question, index) => (
                                <motion.div
                                    key={index}
                                    className="p-0 m-0 w-24 h-32" // adjust the size of the grid items
                                    initial={{ scale: 0.3, zIndex: 0 }} // card is initially smaller and has a z-index of 0
                                    whileHover={{ scale: 1.1, zIndex: 1 }} // card scales up and has a z-index of 1 when hovered over
                                    transition={{ duration: 0.5 }}
                                >
                                    <QuestionCard
                                        className="p-0 m-0"
                                        content={question.content}
                                        quizId={id}
                                        questionId={question.id}
                                        answers={question.answers}
                                        correctAnswer={question.correctAnswer}
                                        points={Number(question.points)}
                                        handleUpdateQuestion={handleUpdateQuestion}
                                        onDelete={handleDeleteQuestion}
                                    />
                                </motion.div>
                            ))
                        ) : (
                            <h1>No questions yet</h1>
                        )}
                    </div>
                    {createMode && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }} // Starts smaller and invisible
                            animate={{ opacity: 1, scale: 1 }} // Scales up to its original size and becomes visible
                            exit={{ opacity: 0, scale: 0.8 }} // Scales down and becomes invisible
                            transition={{ duration: 0.5 }} // The duration of the transition
                        >
                            <div id="create-question-card" className="mr-10 mt-10 ">
                                <div className='card w-80 bg-gradient-to-br from-white to-gray-100 shadow-xl'>
                                    <div className="card-body">
                                        <Label htmlFor="question">Question</Label>
                                        <Input id="question" type="text" placeholder="Enter the question" onChange={handleQuestionChange} />
                                        <Label htmlFor="question">Add answer:</Label>
                                        {answers.map((answer, index) => (
                                            <div key={index} className="flex flex-row justify-between">
                                                <input className="checkbox checkbox-success mr-2" type="checkbox" checked={correctAnswerIndices.includes(index)} onChange={() => handleCheckboxChange(index)} />
                                                <Input type="text" placeholder={`Enter answer ${index + 1}`} value={quiz?.answers} onChange={handleAnswerChange(index)} />
                                                <button className="btn btn-xs ml-2" onClick={() => handleRemoveAnswer(index)}>Remove</button>
                                            </div>
                                        ))}
                                        <button className="btn btn-xs bg-[#90ee90]" onClick={handleAddAnswer}>Include Answer</button>
                                        <Label htmlFor="points">Set points:</Label>
                                        <Input id="points" type="number" value={question.points} placeholder="Enter points" onChange={handlePointsChange} />
                                        <div className="flex mt-3">
                                            <MdDownloadDone className="mr-5" onClick={handleAddQuestion} />
                                            <MdCancel onClick={() => setCreateMode(false)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div id="quiz-management" className="flex flex-col mb-5 mt-7 ml-10">
                        <div className="mb-10">
                            <h1 className="text-xl mb-2 mt-3">Quiz Description</h1>
                            <div className="border-t-2 border-gray-200 mt-2 mb-2"></div>
                            <div className="w-96">
                                <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSetDescription} placeholder="Enter the description" />
                            </div>
                        </div>
                        <div className="flex flex-row justify-between mb-5">
                            <div className="flex flex-col">
                                <h1 className="text-xl mb-2 mt-3">Time Limit</h1>
                                <div className="border-t-2 border-gray-200  mb-2"></div>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-[200px] justify-between">
                                            {timeLimit ? timeRanges.find((framework) => Number(framework.value) === timeLimit)?.label : "Set Time Limit"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <Command>
                                            <CommandGroup>
                                                {timeRanges.map((timeRange) => (
                                                    <CommandItem
                                                        key={timeRange.value}
                                                        value={timeRange.value}
                                                        onSelect={async (currentValue) => {
                                                            setTimeLimit(Number(currentValue));
                                                            setOpen(false);
                                                            await handleSetTime(currentValue);
                                                        }}>
                                                        <Check className={cn("mr-2 h-5 w-4", timeLimit === timeRange.value ? "opacity-100" : "opacity-0")} />
                                                        {timeRange.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="ml-11 ">
                                <h1 className="text-xl mb-2 mt-3">Quiz Deadline</h1>
                                <div className="border-t-2 border-gray-200  mb-2"></div>
                                <div className="flex flex-row mt-2 mb-5">
                                    <DatePickerDemo
                                        selected={date}
                                        onSelect={setDate}
                                    />
                                </div>
                                <div className="">
                                    {quiz?.endsOn && (
                                        remainingTime > 0
                                            ? <p>Time left: {msToTime(remainingTime)}</p>
                                            : <p>Ended On: {`${formatDate(quiz?.endsOn)}`}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row">
                            <div >
                                <div className="flex justify-between ">
                                    <h1 className="text-xl mb-2 mt-3">Grading System </h1>

                                    {/* <FaArrowRight className="mt-5"/> */}
                                </div>
                                <div className="border-t-2 border-gray-200  mb-2 " ></div>
                                <Input type="number" value={grades.good} onChange={(e) => setGrades({ ...grades, good: e.target.value })} placeholder="Satisfactory/Good border" />
                                <Input type="number" value={grades.bad} onChange={(e) => setGrades({ ...grades, bad: e.target.value })} placeholder="Satisfactory/Bad border" />
                            </div>
                            <div className="flex flex-col ml-16 mt-10">
                                <h1 className="text-xl mt-3">Good: {grades.good} and above</h1>
                                <h1 className="text-xl  ">Satisfactory: {grades.bad} - {grades.good}</h1>
                                <h1 className="text-xl ">Bad: {grades.bad} and below</h1>
                            </div>
                        </div>

                        <div className="flex justify-center mt-16">
                            <motion.button
                                onClick={() => handleSaveQuiz(timeLimit, grades, date)}
                                className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-white font-light transition duration-200 ease-linear "
                                initial={{ scale: 2 }}
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                            >
                                Save Changes
                            </motion.button>
                        </div>
                        <button onClick={handleDeleteQuiz} className="btn"> delete</button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default CreateQuiz;