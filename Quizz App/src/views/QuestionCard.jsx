import PropTypes from "prop-types";
import { useState } from "react";
import { updateQuestion } from "../services/questions-service";
import { CiEdit } from "react-icons/ci";
import { RiDeleteBin2Line } from "react-icons/ri";
import { MdDownloadDone } from "react-icons/md";
import { Input } from "../components/ui/input";

const QuestionCard = ({ quizId, questionId, content, answers, points, correctAnswer, handleUpdateQuestion, onDelete, }) => {
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [editedAnswers, setEditedAnswers] = useState([...answers]);
  const [editedPoints, setEditedPoints] = useState(points);
  const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(
    Array.isArray(correctAnswer)
      ? correctAnswer.map((index) => answers[index])
      : [answers[correctAnswer]]
  );

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = async () => {
    const updatedQuestion = {
      id: questionId, content: editedContent, answers: editedAnswers, points: editedPoints, correctAnswer: editedCorrectAnswer
        .map((answer) => editedAnswers.indexOf(answer))
        .filter((i) => i !== -1), // Map the answers back to their indices
    };

    handleUpdateQuestion(updatedQuestion);

    await updateQuestion(
      quizId,
      questionId,
      updatedQuestion.content,
      updatedQuestion.answers,
      updatedQuestion.points,
      updatedQuestion.correctAnswer
    );
    setEditing(false);
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl border">
      <div className="card-body">
        {editing ? (
          <>
            <Input type="text" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
            {editedAnswers.map((answer, index) => (
              <div className="flex flex-row" key={index}>


                <input type="checkbox" defaultChecked className="checkbox checkbox-success" checked={editedCorrectAnswer.includes(editedAnswers[index])}
                  onChange={() => {
                    if (editedCorrectAnswer.includes(editedAnswers[index])) {
                      setEditedCorrectAnswer(
                        editedCorrectAnswer.filter(
                          (answer) => answer !== editedAnswers[index]
                        )
                      );
                    } else {
                      setEditedCorrectAnswer([
                        ...editedCorrectAnswer,
                        editedAnswers[index],
                      ]);
                    }
                  }} />

                <div className="w-64">
                  <Input type="text" value={editedAnswers[index]} onChange={(e) => {
                    const newAnswers = [...editedAnswers]; newAnswers[index] = e.target.value; setEditedAnswers(newAnswers);
                  }} />
                </div>

              </div>
            ))}
            <Input type="number" value={editedPoints} onChange={(e) => setEditedPoints(Number(e.target.value))} />
            {/* <button className="btn btn-outline btn-info" onClick={handleSave}>Save</button> */}
            <MdDownloadDone onClick={handleSave} />
          </>
        ) : (
          <>
            <h2 className="card-title">{content}</h2>
            <ul>
              {answers.map((answer, index) => (
                <li className="" key={index}>{answer}</li>
              ))}
            </ul>
            <p>Points: {points}</p>
            {/* <button className="btn btn-outline btn-info" onClick={handleEdit}>
              Edit
            </button> */}

            <CiEdit onClick={handleEdit} />
            <RiDeleteBin2Line onClick={() => onDelete(questionId)} />
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
