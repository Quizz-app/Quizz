import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { get } from "firebase/database";
import { getQuestionsByQuizId } from "../services/questions-service";
import { getQuizById, incrementFinishedCount } from "../services/quiz-service";
import QuizSolveCard from "../views/QuizSolveCard";
import { useNavigate } from "react-router-dom";
import { updateQuizCompletion } from "../services/users-service";
import Countdown from 'react-countdown';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const QuizSolve = () => {
    const { user, userData } = useContext(AppContext);
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState(0);
    const [countdownTime, setCountdownTime] = useState(0);
    const [isCountdownFinished, setIsCountdownFinished] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quiz = await getQuizById(id);
                const questions = await getQuestionsByQuizId(id);

                questions.sort(() => Math.random() - 0.5);

                setQuiz(quiz);
                setQuestions(questions);
                setCountdownTime(quiz.timeLimit * 60 * 1000); // assuming timeLimit is in minutes

            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);

    const variants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    };

    
    const handleCountdownEnd = async () => {
        // setIsCountdownFinished(true);
        // await updateQuizCompletion(userData.username, id, true);
        // await incrementFinishedCount(id);
        // localStorage.removeItem(`countdownTime-${id}`); // Remove countdownTime from localStorage

        navigate(`/results/${id}`);
    };


    return (
        <>
            <div>
                {!isCountdownFinished ? (
                    <>
                        <Countdown
                            date={Date.now() + countdownTime}
                            onComplete={() => setIsCountdownFinished(true)}
                        />
                        {questions[currentQuestionIndex] && (
                            <motion.div
                                key={currentQuestionIndex}
                                initial="hidden"
                                animate="visible"
                                variants={variants}
                                transition={{ duration: 0.5 }}
                            >
                                <QuizSolveCard question={questions[currentQuestionIndex]} quizId={id} />
                            </motion.div>
                        )}
                        {currentQuestionIndex < questions.length - 1 ? (
                            <button className="btn btn-primary" onClick={() => setCurrentQuestionIndex((prevIndex) => prevIndex + 1)}>Next</button>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline">Finish</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral text-black dark:text-white">
                                    <AlertDialogHeader >
                                        <AlertDialogTitle>You will finish answering to quiz ${quiz.content} </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. It will save your answers and you will be redirected to the results page.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleCountdownEnd}>Finish</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <button className="btn btn-primary" onClick={() => setCurrentQuestionIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : 0)}>Previous</button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <h1 className="text-4xl font-bold mb-4">Time&apos;s up!</h1>
                        <h1>Hooray! You finished {quiz.title} quiz!</h1>
                        <h2>You answered {answeredQuestionsCount} question out of {questions.length}</h2>
                        <button className="btn btn-primary" onClick={() => navigate(`/results/${id}`)}>See Results</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default QuizSolve;