import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useContext} from "react";
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
export const ThreeDCardDemo = ({ quiz }) => {

  const { userData } = useContext(AppContext);
  const navigate = useNavigate();

  const isTeacherOrCreator = (userData?.role === 'teacher')
  const isQuizCompleted = userData?.quizzes?.[quiz.id]?.isCompleted;
  const buttonClickPath = isQuizCompleted ? `/results/${quiz.id}` : isTeacherOrCreator ? `/quiz/${quiz.id}` : `/quiz-preview/${quiz.id}`;
  
  return (
    <CardContainer className=" w-64 h-64 flex-shrink-0 mr-5 p-0">
      <CardBody className="bg-blue-300 relative group/card shadow-custom-light dark:hover:shadow-custom-dark dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.1] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-4">
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-black"
        >
          {quiz?.title}
        </CardItem>
        <CardItem
          as="p"
          translateZ="100"
          className="text-black text-sm max-w-sm mt-2 dark:text-dark-300 text-left truncate overflow-hidden overflow-ellipsis whitespace-nowrap max-w-xs h-20"
        >
          {quiz?.description}
        </CardItem>
        <CardItem
          translateZ={20}
          as="button"
          className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-white dark:text-black text-white text-xs font-bold"
          onClick={() => navigate(buttonClickPath)}
        >
          See quiz
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

export default ThreeDCardDemo;

ThreeDCardDemo.propTypes = {
  quiz: PropTypes.object,
}