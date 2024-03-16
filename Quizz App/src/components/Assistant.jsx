import PropTypes from 'prop-types';
import axios from "axios";
import { useState } from "react";
import { addQuestion } from "../services/questions-service";
import { Input } from './ui/input';
import toast from "react-hot-toast";
import { MultiStepLoader } from './ui/multi-step-loader';


/**
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
const Assistant = ({ quiz, questions }) => {

  const [prompt, setPrompt] = useState("");
  const [assistantResult, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmitAssistant = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading to true when the request starts
    try {
      const res = await axios.post("http://localhost:3000/chat", {
        prompt: prompt,
      });

      const parsedData = JSON.parse(res.data.message);

      setData(parsedData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false); // Set loading to false when the request ends
    }
  };

  const handleQuestionFromAssistant = async (question) => {
    try {
      const isQuestionExists = questions.some(
        (existingQuestion) => existingQuestion.content === question.content
      );

      if (isQuestionExists) {
        return toast.error("This question already exists in the quiz.");
      }

      await addQuestion(
        quiz.id,
        question.content,
        question.answers,
        3,
        question.correctAnswers,
      );
      toast.success("Question added successfully");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div className='flex '>
        <div className='flex justify-center items-center'>
          <div className='w-96'>
            <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Give me a topic" />
          </div>
          <div>
            <button onClick={handleSubmitAssistant} className="relative inline-flex h-10 overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 ml-3">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md bg-white px-3 py-1 text-sm font-medium text-slate-950 backdrop-blur-3xl">
                Ask ✨
              </span>
            </button>
          </div>
        </div>

      </div>
      {isLoading ? (
        <div className='flex flex-col justify-start items-center min-h-screen'>
          <MultiStepLoader loading={isLoading} />

        </div>
      ) : (
        <div>
          {assistantResult?.questions && <div className="ml-10 mr-10">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Answers</th>
                    <th>Correct answer index</th>
                    <th>Add question</th>
                  </tr>
                </thead>
                <tbody>
                  {assistantResult?.questions && (assistantResult?.questions.map((question, index) =>
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{question.content}</td>
                      <td>{question.answers.join(", ")}</td>
                      <td>{question.correctAnswers}</td>
                      <td><button className="btn btn-xs"
                        onClick={() => handleQuestionFromAssistant(question)} >Add question</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}
        </div>)}
    </>
  );
};

export default Assistant;

Assistant.propTypes = {
  quiz: PropTypes.object,
  questions: PropTypes.array,

}