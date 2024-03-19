import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { getUserQuizById, setGradeToUser, setScoreToUser } from "../services/users-service";
import QuestionResultsCard from "./QuestionResultsCard";
import { useNavigate } from "react-router-dom";
import { addFeedback } from "../services/quiz-service";


const QuizResults = () => {

    const { id } = useParams();
    const { userData } = useContext(AppContext);
    const [correctAnswers, setCorrectAnswers] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [totalPoints, setTotalPoints] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [score, setScore] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [points, setPoints] = useState([]);
    const [userQuestions, setUserQuestions] = useState(0);
    const [loading, setLoading] = useState(true);
    const [grades, setGrades] = useState({});
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState({});

    useEffect(() => {
        (async () => {
            const quiz = await getUserQuizById(userData?.username, id);
            setQuiz(quiz);
            setLoading(false);

            if (quiz) {
                const questionsArray = Object.values(quiz.questions);
                const userAnswersObject = quiz.userAnswers;
                const grades = quiz.grades;

                setTotalQuestions(questionsArray.length);
                setQuestions(questionsArray.map(question => question.content));
                setCorrectAnswers(questionsArray.map(question => question.correctAnswer));
                setAnswers(questionsArray.map(question => question.answers));
                // Convert userAnswersObject to an array in the same order as questionsArray
                const userAnswersArray = questionsArray.map((question, index) => userAnswersObject[Object.keys(quiz.questions)[index]]);
                setUserAnswers(userAnswersArray);
                setUserQuestions(userAnswersArray.length);
               
                setTotalPoints(questionsArray.reduce((total, question) => total + Number(question.points), 0));
                setPoints(questionsArray.map(question => question.points));
                setGrades(grades);

            }
        })();
    }, [id, userData]);



    const writeScoreToDatabase = async (score) => {
        // console.log(score);
        if (userData && userData.role === 'student') {
            await setScoreToUser(userData.username, id, score);
        }
    }

    const writeGradeToDatabase = async (score) => {
        if (quiz) {
            if (score >= Number(grades.good)) {
                await setGradeToUser(userData.username, id, "good");
            }
            if (score > Number(grades.bad) && score < Number(grades.good)) {
                await setGradeToUser(userData.username, id, "satisfactory");
            }
            if (score <= Number(grades.bad)) {
                await setGradeToUser(userData.username, id, "bad");
            }
        }
    }

    //an algorith which calculates the total score of the user based on his answers
    useEffect(() => {
        let totalScore = 0;
        for (let i = 0; i < answers.length; i++) {
            const totalPoints = correctAnswers[i].reduce((total, _, index) => {
                if (userAnswers[i][0] === 'null') {
                    return total - total;
                }
                if (correctAnswers[i].length === 1) {
                    if (userAnswers[i].length === 1 && userAnswers[i][0] !== correctAnswers[i][0]) {
                        return total - total;
                    }
                    if (userAnswers[i].length > 1 && !userAnswers[i].includes(index)) {
                        return total - total;
                    }
                    if (userAnswers[i].length === 1 && userAnswers[i][0] === correctAnswers[i][0]) {
                        return total;
                    }
                } else {
                    // console.log('i am calculated'); 
                    // console.log(answers.length);
                    // console.log(points[i] / answers.length);
                    return total - (userAnswers[i].includes(index) ? 0 : Math.floor(points[i] / answers[i].length));
                }
            }, points[i]);

            totalScore += totalPoints;

        }
        setScore(totalScore);

        console.log(score);

        (async () => {
            await writeScoreToDatabase(totalScore);
            await writeGradeToDatabase(totalScore);
        })();

    }, [answers, correctAnswers, userAnswers, points]);


    //might replace with a spinner
    if (loading) {
        return <div>Loading...</div>;
    }

    //rendering the questions and the user's answers in a seperate card component
    const quests = answers.map((answer, index) => {
        const correctAnswer = correctAnswers[index];
        const userAnswer = userAnswers[index];
        const question = questions[index];
        const questionPoints = points[index];

        return (
            <div key={index} className="flex flex-row flex-wrap">
                {correctAnswer && quiz && (
                    <QuestionResultsCard question={question} answers={answer}
                        userAnswers={userAnswer} correctAnswers={correctAnswer}
                        points={questionPoints} />
                )}
            </div>
        );
    });

    const handleFeedback = async () => {
        await addFeedback(id, userData?.uid, feedback);
    }

    return (

        <>
            {quiz && (
                <div className="flex flex-col">
                    {/* overview  */}
                    <div className="flex flex-col" >
                        <div>
                            <h1 className="text-4xl font-bold mb-4">Your performance overview</h1>
                            <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
                        </div>

                        <div className="flex flex-row items-center justify-between">
                            <h2 className="text-2xl font-bold mb-4 ">{userData.role === 'teacher' || userData.isAdmin === 'true' ? `{} score:` : `Your score:`} {score}</h2>
                            <h2 className="text-2xl font-bold mb-4">Total score: {totalPoints}</h2>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-7">
                            <h2 className="text-2xl font-bold ">Total questions: {totalQuestions}</h2>
                            <h2 className="text-2xl font-bold mr-5 ">Answered: {userAnswers.filter(answer => answer !== 'null').length}</h2>
                        </div>
                    </div>

                    {/* answers */}
                    <div className="flex flex-row">
                        <div className="grid grid-cols-5 gap-4">
                            {quests}
                        </div>
                    </div>

                    {/* grades */}
                    <div className="flex items-center justify-center mt-10">
                        <h2 className="text-2xl font-bold mb-4">Overall grade:
                            {quiz &&
                                score >= Number(grades.good) ? "Good" :
                                (score > Number(grades.bad) && score < Number(grades.good)) ? "Satisfactory" :
                                    (score <= Number(grades.bad)) ? "Bad" : ''
                            }
                        </h2>
                    </div>

                    {/* Feedback */}
                    <div>
                        <button className="btn btn-primary" onClick={() => navigate('/my-library')}>Finish</button>
                    </div>
                    <div id="feedback" className="flex">
                        <textarea
                            placeholder="Feedback"
                            className="textarea textarea-bordered textarea-md w-full max-w-xs"
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleFeedback}>Save</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default QuizResults;