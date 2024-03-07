import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { get } from "firebase/database";
import { getQuestionsByQuizId } from "../services/questions-service";
import { getQuizById } from "../services/quiz-service";
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

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

    //THINGS TO BE ADDED TO THE USER'S QUIZZ OBJ: score, time for solving, grade, feedback

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quiz = await getQuizById(id);
                const questions = await getQuestionsByQuizId(id);

                setQuiz(quiz);
                setQuestions(questions);

                const savedCountdownTime = localStorage.getItem(`countdownTime-${id}`)
                if (savedCountdownTime) {
                    setCountdownTime(Number(savedCountdownTime))
                } else {
                    const countdownTime = quiz.quizTime * 60 * 1000;
                    localStorage.setItem(`countdownTime-${id}`, countdownTime.toString())
                    setCountdownTime(countdownTime);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [id, countdownTime]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const quiz = await getQuizById(id);
    //             const questions = await getQuestionsByQuizId(id);

    //             setQuiz(quiz);
    //             setQuestions(questions);
    //             setCountdownTime(quiz.quizTime); // Set countdownTime to quizTime
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     };

    //     fetchData();
    // }, [id]);

    // useEffect(() => {
    //     const countdownTimer = setInterval(() => {
    //         setCountdownTime((prevTime) => {
    //             if (prevTime > 0) {
    //                 return prevTime - 1;
    //             } else {
    //                 // Time is over, update the quiz's isCompleted property
    //                 (async () => {
    //                     await updateQuizCompletion(userData.username, id, true);
    //                 })();
    //                 return 0;
    //             }
    //         });
    //     }, 1000);

    //     return () => {
    //         clearInterval(countdownTimer);
    //     }
    // }, [userData]);

    

    const handleCountdownEnd = async () => {
        setIsCountdownFinished(true);
        await updateQuizCompletion(userData.username, id, true);
        localStorage.removeItem(`countdownTime-${id}`); // Remove countdownTime from localStorage

        navigate(`/results/${id}`);
    };

    return (
        <>
            <div>

                {!isCountdownFinished ? (
                    questions[currentQuestionIndex] && (
                        <>
                            <QuizSolveCard
                                question={questions[currentQuestionIndex]}
                                quizId={id}
                            />

                            <Countdown
                                date={Date.now() + countdownTime}
                                onComplete={handleCountdownEnd}
                                onTick={({ total }) => localStorage.setItem(`countdownTime-${id}`, total.toString())} // Convert to string before saving
                            />

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
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-screen">
                        <h1 className="text-4xl font-bold mb-4">Time&apos;s up!</h1>
                        <h1>Hooray! You finished {quiz.title} quiz!</h1>
                        {/* <h2>Your score is: {user.score}</h2> */}
                        <h2>You answered {answeredQuestionsCount} question out of {questions.length}</h2>
                        <button className="btn btn-primary" onClick={() => navigate(`/results/${id}`)}>See Results</button>
                        <button className="btn btn-primary" onClick={() => navigate(`/my-library`)}>Skip</button>
                    </div>
                )}
            </div >
        </>
    );
};

export default QuizSolve;