import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuizById } from "../services/quiz-service";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { getUserQuizById, setGradeToUser, setScoreToUser } from "../services/users-service";
import { set } from "date-fns";
import QuestionResultsCard from "./QuestionResultsCard";
import { useNavigate } from "react-router-dom";


const QuizResults = () => {
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
    const [retakeOption, setRetakeOption] = useState(false);
    const [grades, setGrades] = useState({});
    const navigate = useNavigate();

    const { id } = useParams();

    const [quiz, setQuiz] = useState({});

    useEffect(() => {
        (async () => {
            const quiz = await getUserQuizById(userData?.username, id);
            console.log(quiz);
            setQuiz(quiz);
            setLoading(false);

            if (quiz) {
                const questionsArray = Object.values(quiz.questions);
                const retake = quiz.retakeOption;
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
                setRetakeOption(retake);


            }

        })();
    }, [id, userData]);


    const writeScoreToDatabase = async (score) => {
        if (userData.role === 'student') {
            await setScoreToUser(userData.username, id, score);
        }
    }

    const writeGradeToDatabase = async (score) => {
        if(quiz){
            if(score >= Number(grades.good)){
                await setGradeToUser(userData.username, id, "good");
            }
            if(score > Number(grades.bad) && score < Number(grades.good)){
                await setGradeToUser(userData.username, id, "satisfactory");
            }
            if(score <= Number(grades.bad)){
                await setGradeToUser(userData.username, id, "bad");
            }
        }
    }

    //an algorith which calculates the total score of the user based on his answers
    useEffect(() => {
        let totalScore = 0;
        for (let i = 0; i < answers.length; i++) {
            if (correctAnswers[i] && quiz) {
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
                        return total - (userAnswers[i].includes(index) ? 0 : Math.floor(points[i] / answers.length));
                    }
                }, points[i]);
                totalScore += totalPoints;
            }
        }
        setScore(totalScore);


        writeScoreToDatabase(totalScore);
        writeGradeToDatabase(totalScore);

    }, [answers, correctAnswers, userAnswers, points]);


    //might replace with a spinner
    if (loading) {
        return <div>Loading...</div>;
    }




    //rendering the questions and the user's answers in a seperate card component
    const quests = answers.map((answer, index) => {
        const correctAnswer = correctAnswers[index];
        console.log(correctAnswer);
        const userAnswer = userAnswers[index];
        const question = questions[index];
        const questionPoints = points[index];

        return (
            <div key={index} className="flex flex-col">
                {correctAnswer && quiz && (
                    <QuestionResultsCard question={question} answers={answer}
                        userAnswers={userAnswer} correctAnswers={correctAnswer}
                        points={questionPoints} />
                )}
            </div>
        );
    });



    return (
        <div className="flex flex-col h-full items-start justify-start p-6 ">
            <h1 className="text-4xl font-bold mb-4">Your performance overview</h1>
            {quiz && (
                <>
                    {/* overview  */}
                    <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>

                    <div className="flex flex-row items-center justify-between">
                        <h2 className="text-2xl font-bold mb-4 ">{userData.role === 'teacher' || userData.isAdmin === 'true' ? `{} score:` : `Your score:`} {score}</h2>
                        <h2 className="text-2xl font-bold mb-4">Total score: {totalPoints}</h2>
                    </div>

                    <div className="flex flex-row items-center justify-center">
                        <h2 className="text-2xl font-bold mb-4">Answered: {userQuestions}</h2>
                        <h2 className="text-2xl font-bold mb-4">Total questions: {totalQuestions}</h2>
                    </div>

                    {/* answers */}
                    {quests}

                    {/* grades */}
                    <div className="flex flex-row items-center justify-center">
                        <h2 className="text-2xl font-bold mb-4">Overall grade:
                        {quiz &&
                                score >= Number(grades.good) ? "Good" :
                                (score > Number(grades.bad) && score < Number(grades.good)) ? "Satisfactory" :
                                    (score <= Number(grades.bad)) ? "Bad" : ''
                            }
                        </h2>
                    </div>

                    {/* Feedback */}
                    <button className="btn btn-primary" onClick={() => navigate('/my-library')}>Finish</button>
                    {retakeOption &&
                        <button className="btn btn-primary" onClick={() => navigate(`/quiz-solve/${id}`)}>Retake Quiz</button>}

                </>
            )}



        </div>



    );
};

export default QuizResults;