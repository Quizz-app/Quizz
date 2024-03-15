import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

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
* }, isCompleted: boolean, onButtonClick: function }} param0 - Props that are passed to the QuizCard component.
*/
export const ThreeDCardDemo = ({ quiz, onButtonClick }) => {

  const { userData } = useContext(AppContext);

  const navigate = useNavigate();
  const isTeacherOrAdmin = (userData.role === 'teacher' && quiz.creator === userData.username)
  const buttonText = isTeacherOrAdmin ? 'See quiz' : 'Start quiz';
  const buttonClickPath = isTeacherOrAdmin ? `/quiz/${quiz.id}` : `/quiz-preview/${quiz.id}`;



  return (
    <CardContainer className="inter-var mr-10 w-64 h-64 flex-shrink-0">
      <CardBody className="bg-gradient-to-r from-cyan-500 to-blue-500 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-6 border transform:">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          {quiz.title}
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className="text-dark-500 text-sm max-w-sm mt-2 dark:text-dark-300 text-left ml-5 truncate"
        >
          {quiz.description}
        </CardItem>
        <div className="flex justify-between items-center mt-10">
          {isTeacherOrAdmin && <CardItem
            translateZ={20}
            as="button"
            target="__blank"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
            onClick={onButtonClick}
          >
            Delete quiz
          </CardItem>}
          {quiz?.isCompleted ? (<CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
            onClick={() => navigate(`/results/${quiz.id}`)}
          >
            See quiz
          </CardItem>)
            :
            (<CardItem
              translateZ={20}
              as="button"
              className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
              onClick={() => navigate(buttonClickPath)}
            >
              {buttonText}
            </CardItem>)}
        </div>
      </CardBody>
    </CardContainer>
  );
}

export default ThreeDCardDemo;

ThreeDCardDemo.propTypes = {
  quiz: PropTypes.object,
  onButtonClick: PropTypes.func
}