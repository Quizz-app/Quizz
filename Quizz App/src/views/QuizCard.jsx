import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { deleteQuizById, getQuizByCreator } from '../services/quiz-service';

const QuizCard = ({ quiz, content, id, isCompleted}) => {
    const { userData } = useContext(AppContext);
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();

    const isTeacherOrAdmin = (userData.role === 'teacher' && quiz.creator === userData.username)
    const buttonText = isTeacherOrAdmin ? 'see quiz' : 'start quiz';
    const buttonClickPath = isTeacherOrAdmin ? `/quiz/${id}` : `/quiz-preview/${id}`;

useEffect(() => {
    (async () => {
        try {
            const quizData = await getQuizByCreator(userData.username);
            setQuizzes(quizData);
        } catch (error) {
            console.error(error);
        }
    })();
}, [quizzes]);

    const deleteQuiz = async () => {
        try {
            await deleteQuizById(id);
            navigate('/my-library');
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="card w-96 bg-base-100 shadow-xl image-full">
            <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
            <div className="card-body">
                <h2 className="card-title"></h2>
                <p>{content}</p>

                <div className="card-actions justify-end">
                    {isCompleted ?
                        <button className="btn btn-primary" onClick={() => navigate(`/results/${id}`)}>See results</button> :
                        <button className="btn btn-primary" onClick={() => navigate(buttonClickPath)}>{buttonText}</button>}
                    {isTeacherOrAdmin && <button className="btn btn-secondary" onClick={deleteQuiz}>Delete</button>}
                </div>
            </div>
        </div>
    )
}

export default QuizCard;

QuizCard.propTypes = {
    content: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    quiz: PropTypes.object.isRequired,
    isCompleted: PropTypes.bool.isRequired,
}