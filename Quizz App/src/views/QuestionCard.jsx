import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { updateQuestion } from "../services/questions-service";

const QuestionCard = ({ quizId, questionId, content, answers, points, correctAnswers, handleUpdateQuestion, onDelete, }) => {
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [editedAnswers, setEditedAnswers] = useState([...answers]);
  const [editedPoints, setEditedPoints] = useState(points);
  // const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(
  //   Array.isArray(correctAnswer)
  //     ? correctAnswer.map((index) => answers[index])
  //     : [answers[correctAnswer]]
  // );
  const [editedCorrectAnswer, setEditedCorrectAnswer] = useState(correctAnswers || []);


  useEffect(() => {
    setEditedCorrectAnswer(correctAnswers || []);
  }, [correctAnswers]);

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
            <input type="text" value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
            {editedAnswers.map((answer, index) => (
              <div key={index}>
                <input type="text" value={editedAnswers[index]} onChange={(e) => {
                  const newAnswers = [...editedAnswers]; newAnswers[index] = e.target.value; setEditedAnswers(newAnswers);
                }} />
                <input type="checkbox" checked={editedCorrectAnswer.includes(index)}
                  onChange={() => {
                    if (editedCorrectAnswer.includes(index)) {
                      setEditedCorrectAnswer(
                        editedCorrectAnswer.filter(
                          (i) => i !== index
                        )
                      );
                    } else {
                      setEditedCorrectAnswer([
                        ...editedCorrectAnswer,
                        index,
                      ]);
                    }
                  }}
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
                <li className="border" key={index}>{answer}</li>
              ))}
            </ul>
            <p>Points: {points}</p>
            <button className="btn btn-outline btn-info" onClick={handleEdit}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => onDelete(questionId)}> delete</button>
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
  correctAnswers: PropTypes.array,
  onDelete: PropTypes.func.isRequired,
};
