import PropTypes from 'prop-types';

const QuestionResultsCard = ({ question, answers, userAnswers = [], correctAnswers, points }) => {
    const totalPoints = correctAnswers.reduce((total, _, index) => {
        if (userAnswers[0] === 'null') {
            return total - total;
        }

        if (correctAnswers.length === 1) {
            // If an answer was selected, subtract points for incorrect answers
            if (userAnswers.length === 1 && userAnswers !== correctAnswers) {
                return total - total;
            }
            if (userAnswers.length > 1 && !userAnswers.includes(index)) {
                return total - total;
            }
        }

        else {
            return total - (userAnswers.includes(index) ? 0 : Math.floor(points / answers.length));
        }

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