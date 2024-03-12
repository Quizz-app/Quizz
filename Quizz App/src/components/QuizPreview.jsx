
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById, setOnGoing } from '../services/quiz-service';
import { getQuestionsByQuizId } from '../services/questions-service';
import QuestionPreviewCard from '../views/QuestionPreviewCard';
import { formatDate, msToTime } from '../services/time-functions';


const QuizPreview = () => {
    const { id } = useParams();
    const [quiz, setQuiz] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const navigate = useNavigate();

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
        <>
            <div className="flex flex-row items-center justify-center">
                {/* //quiz title */}
                {quiz && <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>}

                {/* //action buttons */}
                <div className="flex flex-row items-center justify-center">


                    {/* <p>Total time: {totalTime} s</p>
                    <p>Total points: {totalPoints}</p> */}
                </div>

            </div>

            <div className="flex flex-col items-center justify-center">
                <p>About this quiz: {quiz.description}</p>
                <p>Ends On: {`${formatDate(quiz?.endsOn)}`} Time Left: {msToTime(remainingTime)}</p>
               
            </div>

            <p>Time: {time} m</p>
            <p>Points: {totalPoints}</p>
            <h1> {questions.length} questions</h1>
            <button className="btn btn-primary" onClick={() => navigate(`/quiz-solve/${id}`)}>Start</button>



            <h1 className="text-4xl font-bold mb-4"> Preview</h1>

            <div className="flex flex-row items-center justify-center">
                {questions.map((question, index) => (

                    <div className="card-body" key={index}>
                        <QuestionPreviewCard time={question.time} points={question.points} />
                    </div>

                ))}
            </div>

        </>
    );

}
export default QuizPreview;