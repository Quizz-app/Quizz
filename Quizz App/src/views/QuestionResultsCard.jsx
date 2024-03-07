import PropTypes from 'prop-types';

const QuestionResultsCard = ({ question, answers, userAnswers=[], correctAnswers, points }) => {
    const totalPoints = correctAnswers.reduce((total, _, index) => {
        if (!(userAnswers[0] === 'null')) {
            return total - (userAnswers.includes(index) ? 0 : Math.floor(points / answers.length));
        }
        else {
            return total - total;
        }
    }, points);

    //
    return (
        <div className="card bg-white shadow-md w-screen rounded-lg p-6">
            <div className="card-body border rounded-md w-2/4">
                <h1 className="text-2xl font-bold mb-4">{question}</h1>
                <ul>
                    {answers.map((answer, index) => (
                        <li
                            key={index}
                            className={`p-2 rounded-md mb-2 
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