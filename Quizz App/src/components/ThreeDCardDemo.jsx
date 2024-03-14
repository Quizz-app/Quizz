"use client";
import MyImage from "../components/ui/MyImage";
import { CardBody, CardContainer, CardItem } from "../components/ui/3d-card";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { deleteQuizById } from "../services/quiz-service";
import { EvervaultCard } from "./ui/evervault-card";

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
export const ThreeDCardDemo = ({ quiz }) => {

  const { userData } = useContext(AppContext);

  const navigate = useNavigate();
  const isTeacherOrAdmin = (userData.role === 'teacher' && quiz.creator === userData.username)
  const buttonText = isTeacherOrAdmin ? 'See quiz' : 'Start quiz';
  const buttonClickPath = isTeacherOrAdmin ? `/quiz/${quiz.id}` : `/quiz-preview/${quiz.id}`;
  const deleteQuiz = async () => {
    try {
      await deleteQuizById(quiz.id);
      navigate('/my-library');
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <CardContainer className="inter-var mr-10 ">
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
          className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
        >
          {quiz.description}
        </CardItem>
        {/**TUK MOJE DA SE SLOJI SNIMKA */}
        <CardItem translateZ="100" className="w-1/2 mt-4">
          <MyImage
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt="thumbnail"
          />
        </CardItem>
        <div className="flex justify-between items-center mt-20">
          {isTeacherOrAdmin && <CardItem
            translateZ={20}
            as="button"
            target="__blank"
            className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white"
            onClick={deleteQuiz}
          >
            Delete quiz
          </CardItem>}
          {quiz?.isCompleted ? (<CardItem
            translateZ={20}
            as="button"
            className="px-4 py-2 rounded-xl bg-black dark:bg-white dark:text-black text-white text-xs font-bold"
            onClick={() => navigate(`/results/${quiz.id}`)}
          >
            Sign up
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
  quiz: PropTypes.object
}