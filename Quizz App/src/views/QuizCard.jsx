import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { useContext} from 'react';
import { AppContext } from '../context/AppContext';
import { deleteQuizById } from '../services/quiz-service';
import { formatDate } from "../services/time-functions";
/**
 * QuizCard component displays a card with quiz details.
 * @component
 * @param {{ quiz: { 
 * id: string, 
 * title: string, 
 * category: string, 
 * createdOn: string, 
 * creator: string, 
 * description: string, 
 * endsOn: string, 
 * isPublic: boolean, 
 * quizTime: number, 
 * time: number 
 * }, isCompleted: boolean }} param0 - Props that are passed to the QuizCard component.
 */
const QuizCard = ({ quiz, isCompleted }) => {

    const { userData } = useContext(AppContext);
    const navigate = useNavigate();

    const isTeacherOrAdmin = (userData.role === 'teacher' && quiz.creator === userData.username)
    const buttonText = isTeacherOrAdmin ? 'see quiz' : 'start quiz';
    const buttonClickPath = isTeacherOrAdmin ? `/quiz/${quiz.id}` : `/quiz-preview/${quiz.id}`;

    const deleteQuiz = async () => {
        try {
            await deleteQuizById(quiz.id);
            navigate('/my-library');
        } catch (error) {
            console.error(error);
        }
    }
    console.log(quiz)
    return (
        <div className="card w-96 bg-base-100 shadow-xl image-full">
            <figure><img src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg" alt="Shoes" /></figure>
            <div className="card-body">
                <h2 className="card-title"></h2>
                <p>Title: {quiz.title}</p>
                <p>Category: {quiz.category}</p>
                <p>Ends on: {formatDate(quiz.endsOn)}</p>
                <p>Quiz time: {quiz.quizTime}m</p>
                <div className="card-actions justify-end">
                    {isCompleted ?
                        <button className="btn btn-primary" onClick={() => navigate(`/results/${quiz.id}`)}>See results</button> :
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
    isCompleted: PropTypes.bool
}