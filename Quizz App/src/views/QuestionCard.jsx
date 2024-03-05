import PropTypes from 'prop-types';
import { useState } from 'react';
import { updateQuestion } from '../services/questions-service';

const QuestionCard = ({ quizId, questionId, content, answers,  points, correctAnswer, handleUpdateQuestion, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const [editedAnswers, setEditedAnswers] = useState([...answers]);
    const [editedPoints, setEditedPoints] = useState(points);
    const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(correctAnswer || 0);

    //console.log(questionId);
    const handleEdit = () => {
        setEditing(true);
    };


    const handleSave = async () => {
        handleUpdateQuestion({
            id: questionId, 
            content: editedContent,
            answers: editedAnswers,
            points: editedPoints,
            correctAnswer: editedCorrectAnswer,
        });

        await updateQuestion(quizId, questionId, content, editedAnswers,  editedPoints, editedCorrectAnswer); // Use editedCorrectAnswer
        setEditing(false);
    };

    return (
        <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body">
                {editing ? (
                    <>
                        <input type="text" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
                        {editedAnswers.map((answer, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    value={editedAnswers[index]}
                                    onChange={(e) => {
                                        const newAnswers = [...editedAnswers];
                                        newAnswers[index] = e.target.value;
                                        setEditedAnswers(newAnswers);
                                    }}
                                />
                                <input
                                    type="checkbox"
                                    checked={editedCorrectAnswer === index}
                                    onChange={() => setEditedCorrectAnswer(index)}
                                />
                            </div>
                        ))}
                        <input type="number" value={editedPoints} onChange={(e) => setEditedPoints(Number(e.target.value))} />
                        <button className="btn btn-outline btn-info" onClick={handleSave}>Save</button>
                    </>
                ) : (
                    <>
                        <h2 className="card-title">{content}</h2>
                        <ul>
                            {answers.map((answer, index) => (
                                <li key={index}>{answer}</li>
                            ))}
                        </ul>
                        <p>Points: {points}</p>
                        <button className="btn btn-outline btn-info" onClick={handleEdit}>Edit</button>
                        <button className="btn btn-danger" onClick={() => onDelete(questionId)}>delete</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default QuestionCard;

QuestionCard.propTypes = {
    content: PropTypes.string.isRequired,
    answers: PropTypes.array.isRequired,
    
    points: PropTypes.number.isRequired,
    handleUpdateQuestion: PropTypes.func.isRequired,
    quizId: PropTypes.string.isRequired,
    questionId: PropTypes.string.isRequired,
    correctAnswer: PropTypes.array,
    onDelete: PropTypes.func.isRequired,

};