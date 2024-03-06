import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz, getQuizById, updateQuiz } from "../services/quiz-service";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate, useParams } from "react-router-dom";
import { addQuestion, deleteQuestion, getQuestionsByQuizId, updateQuestion } from "../services/questions-service";
import QuestionCard from "./QuestionCard";
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getUserTeams } from "../services/users-service";

const CreateQuiz = () => {
    const { id } = useParams();
    const [quiz, setQuiz] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState(["", ""]);
    const [createMode, setCreateMode] = useState(false);
    const [correctAnswerIndices, setCorrectAnswerIndices] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);
    //const [quizTime, setQuizTime] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [refreshQuestions, setRefreshQuestions] = useState(false);
    const [open, setOpen] = useState(false)
    const [timeLimit, setTimeLimit] = useState(0)
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
    const [userTeams, setUserTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    

    
    //Set the user teams
    useEffect(() => {
        getUserTeams(userData?.username, setUserTeams);
    }, [userData]);
    //Filter the user teams to get the teams the user is a member of
    const filteredTeams = userTeams.filter(team => team.members[userData?.username]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quiz = await getQuizById(id);
                setQuiz(quiz);
                setTimeLimit(quiz.quizTime || 0);
                setGrades(quiz.grades || { good: 0, bad: 0 });
                setDescription(quiz.description || "");
                setLoading(false);
            }
            catch (error) {
                console.error(error);
            }
        };

        fetchQuiz();
    }, [id]);

    useEffect(() => {
        const fetchQuestions = async () => {    //THIS SYNTAXIS CAUSES A RESURSION
            try {
                const questions = await getQuestionsByQuizId(id);
                setQuestions(questions);

                const totalPoints = questions.reduce((total, question) => total + Number(question.points), 0);
                setTotalPoints(totalPoints);

                await handleSetTime(Number(timeLimit));

            } catch (error) {
                if (error.message === 'No questions found') {
                    setQuestions([]);
                } else {
                    throw error;
                }
            }
        };

        fetchQuestions();  //
    }, [id, refreshQuestions, timeLimit]);



    

    const handleQuestionChange = (e) => {
        setQuestion({ ...question, content: e.target.value });
    };

    const handleAnswerChange = (index) => (e) => {
        const newAnswers = [...answers];
        newAnswers[index] = e.target.value;
        setAnswers(newAnswers);
        setQuestion({ ...question, answers: newAnswers });
    };

    const handleAddQuestion = async () => {
        try {
            await addQuestion(quiz.id, question.content, question.answers, question.points, correctAnswerIndices);

            setCreateMode(false);
            setRefreshQuestions(prev => !prev);
        }
        catch (error) {
            console.error(error);
        }
    };

    const handlePointsChange = (e) => {
        setQuestion({ ...question, points: Number(e.target.value) });
    };

    const handleUpdateQuestion = async (updatedQuestion) => {
        try {
            await updateQuestion(quiz.id, updatedQuestion.id, updatedQuestion.content, updatedQuestion.answers, updatedQuestion.points, updatedQuestion.correctAnswer);

            setRefreshQuestions(prev => !prev);
            setEditingQuestion(null);

        } catch (error) {
            console.error(error);
        }
    };

    const handleAddAnswer = () => {
        setAnswers([...answers, ""]);
    };


    const questionCreation = () => {
        setCreateMode(true);
    }


    const handleCheckboxChange = (index) => {
        if (correctAnswerIndices.includes(index)) {
            setCorrectAnswerIndices(correctAnswerIndices.filter(i => i !== index));
        } else {
            setCorrectAnswerIndices([...correctAnswerIndices, index]);
        }
    };


    const handleRemoveAnswer = (index) => {
        const newAnswers = answers.filter((_, i) => i !== index);
        setAnswers(newAnswers);
        setCorrectAnswerIndices(correctAnswerIndices.filter(i => i !== index));
    };


    const handleDeleteQuestion = async (questionId) => {
        try {
            await deleteQuestion(quiz.id, questionId);
            setRefreshQuestions(prev => !prev);
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
        const updatedQuiz = { ...quiz, quizTime: time };
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

    const timeRanges = [
        {
            value: '5',
            label: "5m",
        },
        {
            value: '10',
            label: "10m",
        },
        {
            value: '15',
            label: "15m",
        },
        {
            value: '20',
            label: "20m",
        },
        {
            value: '25',
            label: "25m",
        },
        {
            value: '30',
            label: "30m",
        },
        {
            value: '40',
            label: "40m",
        },
        {
            value: '50',
            label: "50m",
        },

    ]

    return (
        <>

            <div className="flex flex-row items-center justify-center">
                {/* //quiz title */}
                {quiz && <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>}

                {/* //action buttons */}
                <div className="flex flex-row items-center justify-center">
                    <div className="flex flex-col items-center justify-center">
                        <Button>Assign to group</Button>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <Button onClick={() => navigate('/my-library')}>See all quizzes</Button>
                    </div>
                    <p>Total points: {totalPoints}</p>
                    {/* time */}
                    {/* <Label htmlFor="quizTime">Time limit:</Label>
                    <Input id="quizTime" type="number" value={quizTime} placeholder="Enter quiz time" onChange={handleSetTime} /> */}


                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-[200px] justify-between"
                            >
                                {timeLimit
                                    ? timeRanges.find((framework) => framework.value === timeLimit)?.label
                                    : "Set time limit"}
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
                                            onSelect={(currentValue) => {
                                                setTimeLimit(currentValue)
                                                setOpen(false)
                                                
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-5 w-4",
                                                    timeLimit === timeRange.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {timeRange.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </Command>
                        </PopoverContent>
                    </Popover>



                </div>

            </div>

            <p>Add description:</p>
            <Input type="text" value={description} onChange={(e) => setDescription(e.target.value)} onBlur={handleSetDescription} placeholder="Enter the description" />
            {/* //questions */}
            <div className="flex flex-row items-start justify-start w-screen">
                <div className="flex flex-col items-start justify-start ">
                    {questions ?
                        (
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
                        )
                        :
                        (<h1>No questions yet</h1>)}
                    {createMode &&
                        (
                            <div className=" border rounded-md w-1000px">
                                <div className="p-3">
                                    <div className="flex flex-col items-start justify-start w-800px ">

                                        {/* the question */}
                                        <Label htmlFor="question">Question</Label>
                                        <Input id="question" type="text" placeholder="Enter the question" onChange={handleQuestionChange} />

                                        {/* answers */}
                                        {answers.map((answer, index) => (
                                            <div key={index} className="flex flex-row items-start justify-start w-600px ">
                                                <Input
                                                    type="text"
                                                    placeholder={`Enter answer ${index + 1}`}
                                                    value={quiz?.answers}
                                                    onChange={handleAnswerChange(index)}
                                                />
                                                {/* checkbox for the rigth */}
                                                <div className="flex items-center justify-center ml-5">
                                                    <input
                                                        type="checkbox"
                                                        checked={correctAnswerIndices.includes(index)}
                                                        onChange={() => handleCheckboxChange(index)}
                                                    />
                                                </div>
                                                <button onClick={() => handleRemoveAnswer(index)}>Remove</button>
                                            </div>
                                        ))}
                                        {/* points */}
                                        <Label htmlFor="points">Points</Label>
                                        <Input id="points" type="number" value={question.points} placeholder="Enter points" onChange={handlePointsChange} />

                                        {/* action buttons */}
                                        <button onClick={handleAddAnswer}>Add Answer</button>
                                        <button onClick={handleAddQuestion} disabled={loading}>Save</button>

                                    </div>
                                </div>
                            </div>
                        )}
                    {editingQuestion && (
                        <form onSubmit={() => handleUpdateQuestion(editingQuestion)}>
                            <input
                                type="text"
                                value={editingQuestion.content}
                                onChange={(e) => setEditingQuestion({ ...editingQuestion, content: e.target.value, })}
                            />

                            {/* Add more inputs for other fields */}
                            <button type="submit">Update Question</button>
                        </form>
                    )}


                </div>
                
                <button className="btn btn-outline btn-primary" onClick={questionCreation}>Add +</button>
            </div>
            <div>
            <input className="input input-bordered w-24 md:w-auto mt-2 mb-2" type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for teacher" />
            </div>

            <div className="flex flex-col items-center justify-center">
                <p>Set grades (optional):</p>
                <p>Add indexes:</p>
                <input type="number" value={grades.good} onChange={(e) => setGrades({ ...grades, good: e.target.value })} placeholder="Satisfactory/Good border" />
                <input type="number" value={grades.bad} onChange={(e) => setGrades({ ...grades, bad: e.target.value })} placeholder="Satisfactory/Bad border" />
                <p>Good: {grades.good} and above</p>
                <p>Satisfactory:  {grades.bad} - {grades.good}</p>
                <p>Bad: {grades.bad} and below</p>
                <Button onClick={handleSetGrades}>Set Grades</Button>
            </div>

        </>
    );

}

export default CreateQuiz;