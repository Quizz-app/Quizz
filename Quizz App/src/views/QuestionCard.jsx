import PropTypes from 'prop-types';

const QuestionCard = ({ content, answers, time, points }) => {

    return (
        <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">{content}</h2>
                <ul>
                    {answers.map((answer, index) => (
                        <li key={index}>{answer}</li>
                    ))}
                </ul>
                <p>Time: {time} seconds</p>
                <p>Points: {points}</p>
                <div className="card-actions justify-end">
                    <button className="btn btn-primary">edit</button>
                </div>
            </div>
        </div>
    )

}

export default QuestionCard;

QuestionCard.propTypes = {
    content: PropTypes.string.isRequired,
    answers: PropTypes.array.isRequired,
    time: PropTypes.number.isRequired,
    points: PropTypes.number.isRequired
}