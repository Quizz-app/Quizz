import { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz, getQuizById } from "../services/quiz-service";
import { useState } from "react";

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useParams } from "react-router-dom";
import { addQuestion } from "../services/questions-service";
import QuestionCard from "./QuestionCard";

const CreateQuiz = () => {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState(["", ""]);
    const [createMode, setCreateMode] = useState(false);
    const [correctAnswerIndices, setCorrectAnswerIndices] = useState([]);

    const [question, setQuestion] = useState({
        content: "",
        answers,
        time: 0,
        points: 0
    });

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quiz = await getQuizById(id);
                setQuiz(quiz);
            }
            catch (error) {
                console.error(error);
            }
        };

        fetchQuiz();
    }, [id]); // Add id as a dependency

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
            const newQuestion = await addQuestion(quiz.id, question.content, question.answers, question.time, question.points, correctAnswerIndices);
            setCreateMode(false);
            setQuestions([...questions, newQuestion]);
            console.log(newQuestion);
        }
        catch (error) {
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
                        <Button>Create</Button>
                    </div>
                </div>

            </div>


            <div className="flex flex-row items-start justify-start w-screen">
                <div className="flex flex-col items-start justify-start ">
                    {questions ?
                        (
                            questions.map((question, index) => (
                                <QuestionCard
                                    key={index}
                                    content={question.content}
                                    answers={question.answers}
                                    time={question.time}
                                    points={question.points}
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
                                                    value={quiz.answers}
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

                                        {/* action buttons */}
                                        <button onClick={handleAddAnswer}>Add Answer</button>
                                        <button onClick={handleAddQuestion}>Save</button>

                                    </div>
                                </div>
                            </div>
                        )}



                </div>
                <button className="btn btn-outline btn-primary" onClick={questionCreation}>Add +</button>
            </div>




            {/* <div className="flex flex-col items-center justify-center">
                <input type="text" placeholder="Enter question" onChange={handleQuestionChange} />
                {answers.map((answer, index) => (
                    <div key={index}>
                        <Input
                            type="text"
                            placeholder={`Enter answer ${index + 1}`}
                            value={answer}
                            onChange={handleAnswerChange(index)}
                        />
                        <Input
                            type="checkbox"
                            checked={correctAnswerIndex === index}
                            onChange={() => setCorrectAnswerIndex(index)}
                        />
                    </div>
                ))}
                <button onClick={handleAddAnswer}>Add Answer</button>
                <button onClick={handleAddQuestion}>Save</button>
            </div>

            <div className="flex flex-col items-center justify-center">
                <Button>Create</Button>
            </div> */}


        </>
    );

}

export default CreateQuiz;