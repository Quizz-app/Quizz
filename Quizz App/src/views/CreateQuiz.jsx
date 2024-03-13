import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { addQuizToTeam, getQuizById, inviteUserToQuiz, setEndOn, setOnGoing, updateQuiz, } from "../services/quiz-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, getQuestionsByQuizId, updateQuestion } from "../services/questions-service";
import QuestionCard from "./QuestionCard";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandItem, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { getAllStudents, getUserTeams } from "../services/users-service";
import { Calendar } from "@/components/ui/calendar"
import { toast } from "react-hot-toast";
import { formatDate, msToTime, timeRanges } from "../services/time-functions";
import axios from "axios";
import Assistant from "../components/Assistant";

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
    const [showTeams, setShowTeams] = useState(false);
    const [showUsers, setShowUsers] = useState(false);
    const [showAssistant, setShowAssistant] = useState(false);
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

                    console.log("use effect triggered");
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, [id]); // Only re-run the effect if `id` changes

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const fetchedQuestions = await getQuestionsByQuizId(id);
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
        })();
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
    //Handle the click event to show the teams
    const handleAssignTeamClick = () => {
        setShowTeams(!showTeams);
    };
    //Handle the click event to show the users
    const handleAssignUserClick = () => {
        setShowUsers(!showUsers);
    };

    const handleAssignAssistantClick = () => {
        setShowAssistant(!showAssistant);
    }
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
            console.log(quiz.id);
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
        const updatedQuiz = { ...quiz, description }; // Include quizTime
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
            console.log(quiz);
            //console.log(grades);
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
        if (!description) {
            return toast.error("Please provide a description.");
        }
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

    return (
        <>
            <div className="flex flex-row items-center justify-center">
                {/* //quiz title */}
                {quiz && <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>}
                {/* //action buttons */}
                <div className="flex flex-row items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={handleAssignTeamClick}>Assign to group</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={handleAssignUserClick}>Assign to student</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={handleAssignAssistantClick}>Use Assistant</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={() => navigate("/my-library")}>See all quizzes</Button>
                    </div>
                    <p>Total points: {totalPoints}</p>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-[200px] justify-between">
                                {timeLimit ? timeRanges.find((framework) => framework.value === timeLimit)?.label : "Set time limit"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0">
                            <Command>
                                {/* <CommandInput placeholder="Search framework..." /> */}
                                <CommandEmpty>No time limit set</CommandEmpty>
                                <CommandGroup>
                                    {timeRanges.map((timeRange) => (
                                        <CommandItem
                                            key={timeRange.value}
                                            value={timeRange.value}
                                            onSelect={async (currentValue) => {
                                                setTimeLimit(currentValue);
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
            </div>
            {/* Here we can see all the teams that the current user is in*/}
            {showTeams && filteredTeams.length > 0 && (
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
            {showUsers && students.length > 0 && (
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
            {showAssistant && (
                <Assistant quiz={quiz} />
            )}
            <p>Add description:</p>
            <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSetDescription} placeholder="Enter the description" />
            {/* //questions */}
            <div className="flex flex-row items-start justify-start w-screen">
                <div className="flex flex-col items-start justify-start ">
                    {questions ? (
                        questions.map((question, index) => (
                            <QuestionCard
                                key={index}
                                content={question.content}
                                quizId={id}
                                questionId={question.id}
                                answers={question.answers}
                                correctAnswers={question.correctAnswers}
                                points={Number(question.points)}
                                handleUpdateQuestion={handleUpdateQuestion}
                                onDelete={handleDeleteQuestion}
                            />
                        ))
                    ) : (
                        <h1>No questions yet</h1>
                    )}
                    {createMode && (
                        <div className=" border rounded-md">
                            <div className="p-3">
                                <div className="flex flex-col items-start justify-start w-800px ">
                                    {/* the question */}
                                    <Label htmlFor="question">Question</Label>
                                    <Input id="question" type="text" placeholder="Enter the question" onChange={handleQuestionChange} />
                                    {/* answers */}
                                    {answers.map((answer, index) => (
                                        <div key={index} className="flex flex-row items-start justify-start w-600px ">
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
                <button className="btn btn-outline btn-primary" onClick={questionCreation}>Add +</button>
            </div>

            {/* grading */}
            <div className="flex flex-col items-center justify-center">
                <p>Set grades (optional):</p>
                <p>Add indexes:</p>
                <input type="number" value={grades.good} onChange={(e) => setGrades({ ...grades, good: e.target.value })} placeholder="Satisfactory/Good border" />
                <input type="number" value={grades.bad} onChange={(e) => setGrades({ ...grades, bad: e.target.value })} placeholder="Satisfactory/Bad border" />
                <p>Good: {grades.good} and above</p>
                <p>Satisfactory: {grades.bad} - {grades.good}</p>
                <p>Bad: {grades.bad} and below</p>
                <Button onClick={handleSetGrades}>Set Grades</Button>
            </div>
            <h1>Retake quiz permission </h1>
            <label className="swap">
                <input type="checkbox" onChange={handleRetakeSwap} />
                <div className="swap-on">YES</div> {/* disable */}
                <div className="swap-off">NO</div> {/* enable */}
            </label>
            <div className="">
                {remainingTime > 0
                    ? <p>Ends On: {`${formatDate(quiz?.endsOn)}`} Time left: {msToTime(remainingTime)}</p>
                    : <p>Ended On: {`${formatDate(quiz?.endsOn)}`}</p>}
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                />
                <button onClick={() => setEndOn(id, date)}>Save</button>
            </div>
        </>
    );
};

export default CreateQuiz;
