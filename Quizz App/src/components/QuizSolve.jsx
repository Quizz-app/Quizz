import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { get } from "firebase/database";
import { getQuestionsByQuizId } from "../services/questions-service";
import { getQuizById } from "../services/quiz-service";
import QuizSolveCard from "../views/QuizSolveCard";
import { useNavigate } from "react-router-dom";
import { updateQuizCompletion } from "../services/users-service";

const QuizSolve = () => {
    const { user, userData } = useContext(AppContext);
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [quiz, setQuiz] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answeredQuestionsCount, setAnsweredQuestionsCount] = useState(0);
    const [countdownTime, setCountdownTime] = useState(0);

    const navigate = useNavigate();

    //THINGS TO BE ADDED TO THE USER'S QUIZZ OBJ: score, time for solving, grade, feedback

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quiz = await getQuizById(id);
                const questions = await getQuestionsByQuizId(id);

                setQuiz(quiz);
                setQuestions(questions);
                setCountdownTime(quiz.quizTime);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quiz = await getQuizById(id);
                const questions = await getQuestionsByQuizId(id);

                setQuiz(quiz);
                setQuestions(questions);
                setCountdownTime(quiz.quizTime); // Set countdownTime to quizTime
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const countdownTimer = setInterval(() => {
            setCountdownTime((prevTime) => {
                if (prevTime > 0) {
                    return prevTime - 1;
                } else {
                    // Time is over, update the quiz's isCompleted property
                    (async () => {
                        await updateQuizCompletion(userData.username, id, true);
                    })();
                    return 0;
                }
            });
        }, 1000);

        return () => {
            clearInterval(countdownTimer);
        }
    }, [userData]);

    return (
        <>
            <div>
                <h1>QuizSolve1</h1>
                {countdownTime > 0 ? (
                    questions[currentQuestionIndex] && (
                        <>
                            <QuizSolveCard question={questions[currentQuestionIndex]} quizId={id} onAnswerSelect={() => {
                                setAnsweredQuestionsCount((prevCount) => prevCount + 1);
                            }} />

                            < div className="grid grid-flow-col gap-5 text-center auto-cols-max" >
                                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": Math.floor(countdownTime / 3600) }}></span>
                                    </span>
                                    hours
                                </div>
                                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": Math.floor((countdownTime % 3600) / 60) }}></span>
                                    </span>
                                    min
                                </div>
                                <div className="flex flex-col p-2 bg-neutral rounded-box text-neutral-content">
                                    <span className="countdown font-mono text-5xl">
                                        <span style={{ "--value": countdownTime % 60 }}></span>
                                    </span>
                                    sec
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={() => setCurrentQuestionIndex((prevIndex) => prevIndex < questions.length - 1 ? prevIndex + 1 : prevIndex)}>Next</button>
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