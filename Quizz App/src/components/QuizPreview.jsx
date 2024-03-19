
import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById, setOnGoing } from '../services/quiz-service';
import { getQuestionsByQuizId } from '../services/questions-service';
import QuestionPreviewCard from '../views/QuestionPreviewCard';
import { formatDate, msToTime } from '../services/time-functions';
import TeamCard from './TeamCard';
import { AppContext } from "../context/AppContext";


const QuizPreview = () => {
    const { id } = useParams();
    const [quiz, setQuiz] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);

    const time = quiz.quizTime;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const quizData = await getQuizById(id);
                const quizQuestions = await getQuestionsByQuizId(id);
                setQuiz(quizData);
                setQuestions(quizQuestions);

                const totalPoints = quizQuestions.reduce((total, question) => total + Number(question.points), 0);
                setTotalPoints(totalPoints);
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, []);


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
        <div className='flex flex-col items-center mt-40'>
            <div className="flex flex-col items-center justify-center">
                <div className="card-body items-center justify-center">
                    <div className="card w-3/4 border border-dark bg-500 text-black">
                        <div className="card-body">
                            <p>{`Welcome, ${userData?.firstName}!`}</p>
                            <p>{`You're about to take on the quiz ${quiz.title}. This quiz will challenge you with ${questions.length} questions to solve.`}</p>
                            <p>{`Earn as many as ${totalPoints} points and turn them into victory!`}</p>
                            <p>{`You have until ${formatDate(quiz?.endsOn)} to complete the quiz, so don't delay!`}</p>
                            <p>{`Time remaining `}<strong><em>{msToTime(remainingTime)}</em></strong>{`. Good luck and have fun!`}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="card-actions justify-end">
                <button onClick={() => navigate(`/quiz-solve/${id}`)} className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              Start
            </button>
            </div>
        </div>
    );
}
export default QuizPreview;

