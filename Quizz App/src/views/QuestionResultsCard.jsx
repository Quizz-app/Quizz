import PropTypes from 'prop-types';

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
            <div className='card w-80 bg-gradient-to-br from-white to-gray-100 shadow-xl flex flex-col'>
                <div className="card-body text-black flex-grow">
                    <h2 className="card-title">{question}</h2>
                    <ul>
                        {answers.map((answer, index) => (
                            <li
                                key={index}
                                className={`p-2 rounded-md mb-1 
                            ${correctAnswers.includes(index) ?
                                    "bg-green-500 text-white" :
                                    (userAnswers.includes(index) ? "bg-error text-white" : "bg-gray-200")} 

                            ${userAnswers.includes(index) ? "border-2 border-custom-blue" : ""}`}
                            >
                                {answer}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-5">
                    <p>Correct answer: {answers.map((answer, index) => (
                        correctAnswers.includes(index) ? answer : null
                    )).filter(Boolean).join(', ')} </p>
                    <p className='font-bold'> Points: {totalPoints} out of {points}</p>
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