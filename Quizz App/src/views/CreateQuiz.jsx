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

const CreateQuiz = () => {
    const { id } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [answers, setAnswers] = useState({});

    const [question, setQuestion] = useState({
        content: "",
        answers: { 
            question1: true, 
            question2: false, 
            question3: false, 
            question4: false },
        time: 0,
        points: 0

    });


    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const quiz = await getQuizById(id);
                setQuiz(quiz);
                console.log(quiz);
            }
            catch (error) {
                console.error(error);
            }
        };

        fetchQuiz();
    }, [id]); // Add id as a dependency

    const handleAddQuestion = async () => {
        try {
            const question = await addQuestion(quiz.id, content, answers, time, points);
            setQuestions([...questions, question]);
        }
        catch (error) {
            console.error(error);
        }
    }


    return (
        <>
            <div className="flex flex-row items-center justify-center">

                {quiz && <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>}



                <div className="flex flex-row items-center justify-center">
                    {/* <div className="flex flex-row items-center justify-center">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="number" placeholder="Enter the time in minutes" />
            </div> */}

                    <div className="flex flex-col items-center justify-center">
                        <Button>Assign to group</Button>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <Button>Create</Button>
                    </div>
                </div>


            </div>

            <div className="flex flex-col">
                <input className="border mb-3" name="content" type="text" />
                <input className="border mb-3" name="answer" type="text" />
                <input className="border mb-3" name="answer" type="text" />
                <input className="border mb-3" name="answer" type="text" />
                <input className="border mb-3" name="answer" type="text" />
                <button>Add question</button>
            </div>
        </>
    );

}

export default CreateQuiz;