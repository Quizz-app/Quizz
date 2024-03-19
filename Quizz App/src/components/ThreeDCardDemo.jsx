import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { areUsersInSameTeam } from "../services/teams-service";


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
export const ThreeDCardDemo = ({ quiz, teamId }) => {

  const { userData } = useContext(AppContext);
  const [inSameTeam, setInSameTeam] = useState(false);

  const navigate = useNavigate();
  const isTeacherOrCreator = (userData?.role === 'teacher' && quiz.creator === userData.username)
  const isTeamMember = inSameTeam && userData?.username !== quiz?.creator;
  const buttonText = isTeacherOrCreator || isTeamMember ? 'See quiz' : 'Start quiz';
  const buttonClickPath = isTeacherOrCreator || isTeamMember ? `/quiz/${quiz.id}` : `/quiz-preview/${quiz.id}`;

  areUsersInSameTeam(userData?.username, quiz?.creator, teamId).then(setInSameTeam);

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
          className="text-black text-sm max-w-sm mt-2 dark:text-dark-300 text-left font-bold truncate overflow-hidden overflow-ellipsis whitespace-nowrap max-w-xs h-20"
        >
          {quiz?.description}
        </CardItem>
        {quiz?.isCompleted ? (<CardItem
          translateZ={20}
          as="button"
          className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-white dark:text-black text-white text-xs font-bold"
          onClick={() => navigate(`/results/${quiz?.id}`)}
        >
          See quiz
        </CardItem>)
          :
          (<CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-xl bg-blue-600 dark:bg-white dark:text-black text-white text-xs font-bold"
            onClick={() => navigate(buttonClickPath)}
          >
            {buttonText}
          </CardItem>)}
      </CardBody>
    </CardContainer>
  );
}

export default ThreeDCardDemo;

ThreeDCardDemo.propTypes = {
  quiz: PropTypes.object,
  teamId: PropTypes.string,

}