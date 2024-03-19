import { Link } from "react-router-dom";
import ThreeDCardDemo from "./ThreeDCardDemo";

const DummyQuizzes = () => {

    const quizzes = [
        { id: '-NtL85WZy1WdDxX31r6W', title: "Pop Music Culture",  }
        // More quizzes...
    ];

    return (
        <div>
            <ul>
                {quizzes.map((quiz) => (
                    <li key={quiz.id}>
                        <ThreeDCardDemo quiz={quiz} />
                        <Link to={`/quiz/-NtL85WZy1WdDxX31r6W`}>{quiz.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DummyQuizzes;