import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { createQuiz } from "../services/quiz-service";
import { useState } from "react";


const CreateQuiz = () => {
    const { userData } = useContext(AppContext);

    const [quiz, setQuiz] = useState({
        title: "",
        creator: "",
        category: "",
        time: 0,
        questions: [],
        isPublic: true,
    });

    const updateForm = (prop) => (e) => {
        setQuiz({
            ...quiz,
            [prop]: e.target.value,
        });
    };

    const quizCreation = async () => {
        try {
            await createQuiz(userData.username, quiz.title, quiz.category, quiz.isPublic, quiz.time, quiz.questions);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div >

            <h1>Create Quiz</h1>

            <div className="flex flex-col w-1/2">

                <label htmlFor="title">Title:</label>
                <input
                    value={quiz.title}
                    onChange={updateForm("title")}
                    type="text"
                ></input>

                <label htmlFor="category">Category:</label>
                <input
                    value={quiz.category}
                    onChange={updateForm("category")}
                    type="text"
                ></input>

                <label htmlFor="time">Time:</label>
                <input
                    value={quiz.time}
                    onChange={updateForm("time")}
                    type="number"
                ></input>

                <label htmlFor="isPublic">Visibility:</label>
                <select
                    value={quiz.isPublic ? "Public" : "Private"}
                    onChange={event => updateForm("isPublic")({ target: { value: event.target.value === "Public" } })}
                >
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                </select>

                <button onClick={quizCreation}>Create Quiz</button>

            </div>

        </div>
    );
}

export default CreateQuiz;