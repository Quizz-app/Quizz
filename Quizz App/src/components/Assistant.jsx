import PropTypes from 'prop-types';
import axios from "axios";
import { useState } from "react";
import { addQuestion } from "../services/questions-service";
import { Input } from './ui/input';

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
const Assistant = ({ quiz }) => {

  const [prompt, setPrompt] = useState("");
  const [assistantResult, setData] = useState(null);

  const handleSubmitAssistant = async (e) => {
    e.preventDefault();
    const res = await axios.post("http://localhost:3000/chat", {
      prompt: prompt,
    });

    const parsedData = JSON.parse(res.data.message);

    setData(parsedData);
  };

  const handleQuestionFromAssistant = async (question) => {
    try {
      await addQuestion(
        quiz.id,
        question.content,
        question.answers,
        3,
        question.correctAnswers,
      );
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <div>
        <Input className="w-96 h-10 border" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button onClick={handleSubmitAssistant} className="btn"> Ask </button>
       
      </div>
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
      </div>
    </>
  );
};

export default Assistant;

Assistant.propTypes = {
  quiz: PropTypes.object.isRequired
}