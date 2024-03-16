import { useState } from "react";
import PropTypes from 'prop-types';
import ThreeDCardDemo from "./ThreeDCardDemo";


export const QuizCardPaginated = ({ currentQuiz, quizzesPerPage, deleteQuiz }) => {

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(currentQuiz.length / quizzesPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;

    const currentQuizzes = currentQuiz.slice(indexOfFirstQuiz, indexOfLastQuiz);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <>
            <div className="grid grid-cols-5">
                {currentQuizzes.map((quiz, index) => (
                    <ThreeDCardDemo key={index} quiz={quiz} onButtonClick={deleteQuiz} />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="justify-center flex mt-5 mb-3">
                    {currentPage > 1 && <button className="join-item btn btn-outline mr-2" onClick={() => paginate(currentPage - 1)}>Previous</button>}
                    {pageNumbers.map(number => (
                        <button key={number} className={`join-item btn mr-2 ${number === currentPage ? 'btn-primary' : ''}`} onClick={() => paginate(number)}>{number}</button>
                    ))}
                    {currentPage < totalPages && <button className="join-item btn btn-outline" onClick={() => paginate(currentPage + 1)}>Next</button>}
                </div>
            )}
        </>
    )
};

QuizCardPaginated.propTypes = {
    currentQuiz: PropTypes.array,
    quizzesPerPage: PropTypes.number,
    deleteQuiz: PropTypes.func
}

export default QuizCardPaginated;