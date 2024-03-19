import PropTypes from 'prop-types';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const QuestionResultsCard = ({ question, answers, userAnswers = [], correctAnswers, points }) => {

    console.log(userAnswers);
    console.log(correctAnswers);
    console.log(points);
    const totalPoints = correctAnswers.reduce((total, correctAnswer, index) => {
        if (userAnswers[0] === 'null') {
            return 0;
        }
        if (correctAnswers.length === 1) {
            if (userAnswers[0] !== correctAnswer) {
                return 0;
            }
        } else if (!userAnswers.includes(correctAnswer)) {
            return total - Math.floor(points / answers.length);
        }
        return total;
    }, points);


    return (
        <>
            <div className='card w-80 bg-gradient-to-br from-white to-gray-100 shadow-xl'>
                <div className="card-body text-black">
                    <h2 className="card-title">{question}</h2>
                    <ul>
                        {answers.map((answer, index) => (
                            <li
                                key={index}
                                className={`p-2 rounded-md mb-1 
                            ${correctAnswers.includes(index) ?
                                        "bg-green-500 text-white" :
                                        (userAnswers.includes(index) ? "bg-red-500 text-white" : "bg-gray-200")} 

                            ${userAnswers.includes(index) ? "border-2 border-black" : ""}`}
                            >
                                {answer}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4">Correct answer: {answers.map((answer, index) => (
                        correctAnswers.includes(index) ? answer : null
                    )).filter(Boolean).join(', ')} </p>
                    <p>Points: {totalPoints} out of {points}</p>
                </div>
            </div>
        </>


    );
};

export default QuestionResultsCard;

QuestionResultsCard.propTypes = {
    question: PropTypes.string.isRequired,
    answers: PropTypes.array.isRequired,
    userAnswers: PropTypes.array.isRequired,
    correctAnswers: PropTypes.array.isRequired,
    points: PropTypes.number.isRequired
};