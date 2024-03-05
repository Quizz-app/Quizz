import PropTypes from 'prop-types';
import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { addUserAnswer } from '../services/users-service';


const QuizSolveCard = ({ question, quizId, onAnswerSelect }) => {
    const {userData} = useContext(AppContext);
    //const history = useHistory();

    //inside the user's quizzes current quiz the quiz's question whole object should be present
    //inside this object there will be a new prop creted 'my answers' which will be an array of the user's answers
    //for every queston - get its points and for every user answer which is not matching to the quiz's correct answer - take points
    //by this formula: ponits for the question - (points for the question / number of answers) 

    const [selectedAnswers, setSelectedAnswers] = useState([]);

    useEffect(() => {
        setSelectedAnswers([]);
    }, [question.id]);


    useEffect(() => {
        if (selectedAnswers.length > 0) { // Only call addUserAnswer if selectedAnswers is not empty
            (async () => {
                await addUserAnswer(userData.username, quizId, question.id, selectedAnswers);
                onAnswerSelect();
            })();
        }
    }, [selectedAnswers]);

    const handleCheckboxChange = (index) => {
        if (selectedAnswers.includes(index)) {
            setSelectedAnswers(selectedAnswers.filter(i => i !== index));
        } else {
            setSelectedAnswers([...selectedAnswers, index]);
        }

    };


    //console.log(selectedAnswers);

    return (
        <>
            <div className="flex flex-col items-center justify-center">
                {/* //quiz title */}
                {question && <h1 className="text-4xl font-bold mb-4">{question.content}</h1>}

                {/* //question answers */}
                {question && question.answers.map((answer, index) => (
                    <div key={index} className="flex flex-row items-start justify-start w-600px ">
                        <p key={index} className="text-xl mb-4">{answer}</p>


                        {/* checkbox for the rigth */}
                        <div className="flex items-center justify-center ml-5">
                        <input
                                type="checkbox"
                                checked={selectedAnswers.includes(index)}
                                onChange={() => handleCheckboxChange(index)}
                            />
                        </div>


                    </div>
                ))}

                {/* //question points */}
                {question && <p className="text-xl mb-4">Points: {question.points}</p>}

            </div>
        </>
    );
};

export default QuizSolveCard;

QuizSolveCard.propTypes = {
    question: PropTypes.object.isRequired,
    quizId: PropTypes.string.isRequired,
    onAnswerSelect: PropTypes.func.isRequired,
};
