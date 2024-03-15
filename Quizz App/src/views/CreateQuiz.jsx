import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { addQuizToTeam, getQuizById, inviteUserToQuiz, observeQuiz, setEndOn, setOnGoing, updateQuiz, } from "../services/quiz-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, getQuestionsByQuizId, listenForQuestions, updateQuestion } from "../services/questions-service";
import QuestionCard from "./QuestionCard";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandItem, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { getAllStudents, getUserTeams } from "../services/users-service";
import { Calendar } from "@/components/ui/calendar"
import { toast } from "react-hot-toast";
import { formatDate, msToTime, timeRanges } from "../services/time-functions";
import Assistant from "../components/Assistant";
import { DatePickerDemo } from "../components/DatePicker";
import { AiOutlineTeam } from "react-icons/ai";
import { PiStudent } from "react-icons/pi";
import { MdDoneAll } from "react-icons/md";
import { ScrollArea } from "@/components/ui/scroll-area"
// import { Separator } from "@/components/ui/separator"
import { motion } from 'framer-motion';


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
                console.log(fetchedQuiz);
                if (JSON.stringify(fetchedQuiz) !== JSON.stringify(quiz)) {
                    setQuiz(fetchedQuiz);
                    setTimeLimit(fetchedQuiz.quizTime || 0);
                    console.log(timeLimit);
                    setGrades(fetchedQuiz.grades || { good: 0, bad: 0 });
                    setDescription(fetchedQuiz.description || "");
                    setLoading(false);

                    // console.log("use effect triggered");
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

    const handleSetGrades = async () => {
        if (grades.good !== 0 || grades.bad !== 0) {
            const updatedQuiz = { ...quiz, grades };
            try {
                await updateQuiz(id, updatedQuiz);
                setQuiz(updatedQuiz);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleRetakeSwap = async () => {
        const updatedQuiz = { ...quiz, retakeOption: !quiz.retakeOption };
        try {
            await updateQuiz(id, updatedQuiz);
            setQuiz(updatedQuiz);
        } catch (error) {
            console.error(error);
        }
    };

    //STATE HANDLERS
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
        // if (!description) {
        //     return toast.error("Please provide a description.");
        // }
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



    return (
        <>
            <div className="mx-20 my-10">
                <div className="flex flex-row items-center justify-between">
                    {/* quiz title */}
                    <h1 className="text-4xl font-bold mb-4">{quiz?.title}</h1>
                    <p>Total points: {totalPoints}</p>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-[200px] justify-between">
                                {timeLimit ? timeRanges.find((framework) => Number(framework.value) === timeLimit)?.label : "Set Time Limit"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                {/* <CommandInput placeholder="Search framework..." /> */}
                                {/* <CommandEmpty>No time limit set</CommandEmpty> */}
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

                    {/* action buttons */}
                    <div className="flex flex-row items-center justify-center">
                        <div className="flex flex-col items-center justify-center">

                            <Button onClick={() => handleButtonClick('assignTeam')}> <AiOutlineTeam />   Assign to group</Button>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Button onClick={() => handleButtonClick('assignUser')}> <PiStudent /> Assign to student</Button>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <Button onClick={() => navigate("/my-library")}> <MdDoneAll /> Save Changes</Button>
                        </div>
                    </div>

                </div>
                <div className="border-t-2 border-gray-200 mb-2"></div>

                {/* Here we can see all the teams that the current user is in*/}
                {openPanel === 'assignTeam' && filteredTeams.length > 0 && (
                    <div>
                        <h1>TUK SE POKAZVAT OTBORITE V KOITO UCHSTVA SLED KATO E NATISNAL Assignto group</h1>
                        {filteredTeams.map((team) => (
                            <div key={team.id}>
                                <p>{team.name}</p>
                                <button onClick={() => handleAddQuizToTeam(team.id)}>Add quiz to team</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Here we can see all the students that are in the system*/}
                {openPanel === 'assignUser' && students.length > 0 && (
                    <div>
                        <input className="input input-bordered w-24 md:w-auto mt-2 mb-2" type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search for student" />
                        {searchTerm.length > 2 &&
                            filteredStudents.map((student, index) => (
                                <div key={index}>
                                    <p>{student.username}</p>
                                    <button onClick={() => handleAddQuizToStudent(student)}>
                                        Add quiz to student
                                    </button>
                                </div>
                            ))}
                    </div>
                )}
                {/* Here we can see the assistant */}

                <div className="flex flex-row items-center justify-between pb-4">
                    <div>
                        <p>Description:</p>
                        <div className="w-96">
                            <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSetDescription} placeholder="Enter the description" />
                        </div>
                    </div>
                    <div className="flex flex-row items-center justify-center">
                        <button className="btn btn-outline btn-primary " onClick={questionCreation}>Add question +</button>
                        <div className="flex flex-col items-center justify-center">
                            <Button onClick={() => handleButtonClick('assignAssistant')}>Use Assistant ✨</Button>
                        </div>
                    </div>
                </div>

                <div className="border-t-2 border-neon-green"></div>

                {openPanel === 'assignAssistant' && (
                    <ScrollArea className="h-[300px] w-[1350px] rounded-md border p-4">
                        <Assistant quiz={quiz} />
                    </ScrollArea>
                )}



                <div className="flex flex-row items-start justify-start">
                    <div>
                        {/* //questions */}
                        <div className="flex flex-row items-start justify-start ">
                            {/* <div className="flex flex-col items-start justify-start "> */}
                            <div className="grid grid-cols-4 gap-1 items-start justify-start w-800px">
                                {questions ? (
                                    questions.map((question, index) => (
                                        <motion.div
                                            key={index}
                                            className="p-0 m-0 w-24 h-32" // adjust the size of the grid items
                                            initial={{ scale: 0.3, zIndex: 0 }} // card is initially smaller and has a z-index of 0
                                            whileHover={{ scale: 1.1, zIndex: 1 }} // card scales up and has a z-index of 1 when hovered over
                                            transition={{ duration: 0.3 }}
                                        >
                                            <QuestionCard
                                                className="p-0 m-0"
                                                content={question.content}
                                                quizId={id}
                                                questionId={question.id}
                                                answers={question.answers}
                                                correctAnswers={question.correctAnswers}
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
                                <div className=" border rounded-md">
                                    <div className="p-3">
                                        <div className="flex flex-col items-start justify-start w-500px ">
                                            {/* the question */}
                                            <Label htmlFor="question">Question</Label>
                                            <Input id="question" type="text" placeholder="Enter the question" onChange={handleQuestionChange} />
                                            {/* answers */}
                                            {answers.map((answer, index) => (
                                                <div key={index} className="flex flex-row items-start justify-start w-96 ">
                                                    <Input type="text" placeholder={`Enter answer ${index + 1}`} value={quiz?.answers} onChange={handleAnswerChange(index)}
                                                    />
                                                    {/* checkbox for the rigth */}
                                                    <div className="flex items-center justify-center ml-5">
                                                        <input type="checkbox" checked={correctAnswerIndices.includes(index)} onChange={() => handleCheckboxChange(index)} />
                                                    </div>
                                                    <button onClick={() => handleRemoveAnswer(index)}>Remove</button>
                                                </div>
                                            ))}
                                            {/* points */}
                                            <Label htmlFor="points">Points</Label>
                                            <Input id="points" type="number" value={question.points} placeholder="Enter points" onChange={handlePointsChange} />
                                            {/* action buttons */}
                                            <button onClick={handleAddAnswer}>Add Answer</button>
                                            <button onClick={handleAddQuestion} disabled={loading}>
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {editingQuestion && (
                                <form onSubmit={() => handleUpdateQuestion(editingQuestion)}>
                                    <input
                                        type="text"
                                        value={editingQuestion.content}
                                        onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value, })} />
                                    {/* Add more inputs for other fields */}
                                    <button type="submit">Update Question</button>
                                </form>
                            )}

                        </div>
                    </div>


                    <div className="flex flex-col items-start justify-center ml-10 mt-10">
                        {/* grading */}
                        <div className="flex flex-col items-start justify-center">
                            <h1 className="text-2xl font-bold mb-4"> Grading</h1>

                            <div className="flex space-x-4">
                                <div>
                                    <p>Add indexes:</p>
                                    <Input type="number" value={grades.good} onChange={(e) => setGrades({ ...grades, good: e.target.value })} placeholder="Satisfactory/Good border" />
                                    <Input type="number" value={grades.bad} onChange={(e) => setGrades({ ...grades, bad: e.target.value })} placeholder="Satisfactory/Bad border" />
                                </div>
                                <div className="flex flex-col items-center justify-center pl-20">
                                    <p>Good: {grades.good} and above</p>
                                    <p>Satisfactory: {grades.bad} - {grades.good}</p>
                                    <p>Bad: {grades.bad} and below</p>
                                    <Button onClick={handleSetGrades}>Set Grades</Button>
                                </div>
                            </div>
                        </div>



                        <div className="mt-10">
                            <h1 className="text-2xl font-bold mb-4">Due Date</h1>
                            <div className="flex flex-row items-center justify-start">
                                <DatePickerDemo
                                    selected={date}
                                    onSelect={setDate}
                                />
                                <div className="ml-10">
                                    {quiz?.endsOn && (
                                        remainingTime > 0
                                            ? <p>Time left: {msToTime(remainingTime)}</p>
                                            : <p>Ended On: {`${formatDate(quiz.endsOn)}`}</p>
                                    )}
                                </div>
                            </div>

                            <button className="" onClick={() => setEndOn(id, date)}>Save date</button>
                        </div>

                        <div className="flex flex-roe items-start justify-center mt-10">
                            <h1 className="text-2xl font-bold mb-4">Retake Quiz</h1>
                            <div className="flex flex-row items-center justify-start">
                                <label className="flex swap items-center align-center">
                                    <input type="checkbox" onChange={handleRetakeSwap} />
                                    <div className="swap-on text-2xl">YES</div> {/* disable */}
                                    <div className="swap-off text-2xl">NO</div> {/* enable */}
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </>
    );
};

export default CreateQuiz;
