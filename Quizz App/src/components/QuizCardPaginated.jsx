import { useState } from "react";
import PropTypes from 'prop-types';
import ThreeDCardDemo from "./ThreeDCardDemo";


export const QuizCardPaginated = ({ currentQuiz, quizzesPerPage, teamId }) => {

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(currentQuiz.length / quizzesPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const indexOfLastQuiz = currentPage * quizzesPerPage;
    const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;

    const currentQuizzes = currentQuiz.slice(indexOfFirstQuiz, indexOfLastQuiz);

    const paginate = pageNumber => setCurrentPage(pageNumber);

    return (
        <>
            <div className="flex flex-col">
                <div className="grid grid-cols-4">
                    {currentQuizzes.map((quiz, index) => (
                        <ThreeDCardDemo key={index} quiz={quiz} teamId={teamId} />
                    ))}
                </div>
                {totalPages > 1 && (
                    <div className="justify-center flex mt-5 mb-5">
                        {currentPage > 1 && <button className="join-item btn btn-outline mr-2" onClick={() => paginate(currentPage - 1)}>Previous</button>}
                        {pageNumbers.map(number => (
                            <button key={number} className={`join-item btn mr-2 ${number === currentPage ? 'btn bg-gradient-to-r from-cyan-500 to-blue-500' : ''}`} onClick={() => paginate(number)}>{number}</button>
                        ))}
                        {currentPage < totalPages && <button className="join-item btn " onClick={() => paginate(currentPage + 1)}>Next</button>}
                    </div>
                )}
            </div>
        </>
    )
};

QuizCardPaginated.propTypes = {
    currentQuiz: PropTypes.array,
    quizzesPerPage: PropTypes.number,
    teamId: PropTypes.string

}

export default QuizCardPaginated;