import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
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
import { AnimatePresence } from "framer-motion";

const QuizSolve = () => {
    const { user, userData } = useContext(AppContext);
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState(0);
    const [countdownTime, setCountdownTime] = useState(0);
    const [isCountdownFinished, setIsCountdownFinished] = useState(false);
    const [endTime, setEndTime] = useState(null);

    const navigate = useNavigate();

    //THINGS TO BE ADDED TO THE USER'S QUIZZ OBJ: score, time for solving, grade, feedback
    useEffect(() => {
        const fetchData = async () => {
            try {
                const quiz = await getQuizById(id);
                const questions = await getQuestionsByQuizId(id);

                questions.sort(() => Math.random() - 0.5);

                setQuiz(quiz);
                setQuestions(questions);

                const savedEndTime = localStorage.getItem(`endTime-${id}`)
                if (savedEndTime) {
                    setEndTime(Number(savedEndTime));
                } else {
                    const countdownTime = quiz.quizTime * 60 * 1000;
                    const endTime = Date.now() + countdownTime;
                    localStorage.setItem(`endTime-${id}`, endTime.toString())
                    setEndTime(endTime);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [id]); // Removed countdownTime from the dependency array

    const handleCountdownEnd = async () => {
        setIsCountdownFinished(true);
        await updateQuizCompletion(userData.username, id, true);
        await incrementFinishedCount(id);
        localStorage.removeItem(`countdownTime-${id}`); // Remove countdownTime from localStorage

        navigate(`/results/${id}`);
    };

    const variants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1 },
    };

    return (
        <>
            <div className="flex justify-center mt-10">
                {!isCountdownFinished ? (
                    questions[currentQuestionIndex] && (
                        <div className="mt-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <QuizSolveCard question={questions[currentQuestionIndex]} quizId={id} />
                                </motion.div>
                            </AnimatePresence>
                            <div className="flex justify-between mt-10">
                                <motion.button
                                    onClick={() => setCurrentQuestionIndex((prevIndex) => prevIndex > 0 ? prevIndex - 1 : 0)}
                                    className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-white font-bold transition duration-200 ease-linear "
                                    initial={{ scale: 2 }}
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                                >
                                    Previous
                                </motion.button>
                                <div className="text-2xl flex">
                                    <p className="mr-2">Time left:</p>
                                    <Countdown date={endTime} onComplete={handleCountdownEnd} onTick={({ total }) =>
                                        localStorage.setItem(`endTime-${id}`, (Date.now() + total).toString())} />
                                </div>
                                {currentQuestionIndex < questions.length - 1 ? (
                                    <motion.button
                                        onClick={() => setCurrentQuestionIndex((prevIndex) => prevIndex + 1)}
                                        className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-[rgba(144,238,144,0.9)] px-8 py-2 bg-[#90ee90] rounded-md text-white font-bold transition duration-200 ease-linear "
                                        initial={{ scale: 2 }}
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                                    >
                                        Next
                                    </motion.button>
                                ) : (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline">Finish</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-neutral text-black dark:text-white">
                                            <AlertDialogHeader >
                                                <AlertDialogTitle>You will finish answering to quiz {quiz.content} </AlertDialogTitle>
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
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <h1 className="text-4xl font-bold mb-4">Time&apos;s up!</h1>
                        <h1>Hooray! You finished {quiz.title} quiz!</h1>
                        {/* <h2>Your score is: {user.score}</h2> */}
                        <h2>You answered {answeredQuestionsCount} question out of {questions.length}</h2>
                        <button className="btn btn-primary" onClick={() => navigate(`/results/${id}`)}>See Results</button>
                        {/* <button className="btn btn-primary" onClick={() => navigate(`/my-library`)}>Skip</button> */}
                    </div>
                )}
            </div >
        </>
    );
};

export default QuizSolve;