import { useState } from "react";
import PropTypes from 'prop-types';

export const TableWithPagination = ({ array, pages, addMember }) => {

    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(array.length / pages);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const indexOfLastQuiz = currentPage * pages;
    const indexOfFirstQuiz = indexOfLastQuiz - pages;

    const currentArray = array.slice(indexOfFirstQuiz, indexOfLastQuiz);

    const paginate = pageNumber => setCurrentPage(pageNumber);
    return (
        <>
            <table className="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Job</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentArray.map((member, index) =>
                        <tr key={index}>
                            <th>{index + 1}</th>
                            <td>{member?.username}</td>
                            <td>{member?.role}</td>
                            <td>{member?.email}</td>
                            <button onClick={() => addMember(member)} className="btn btn-xs">Add to team</button>
                        </tr>
                    )}
                </tbody>
            </table>
            <div className="divider"></div>
            {totalPages > 1 && (
                <div className="justify-center flex mt-5 mb-5">
                    {currentPage > 1 && <button className="join-item btn btn-outline mr-2" onClick={() => paginate(currentPage - 1)}>Previous</button>}
                    {pageNumbers.map(number => (
                        <button key={number} className={`join-item btn mr-2 ${number === currentPage ? 'btn bg-gradient-to-r from-cyan-500 to-blue-500' : ''}`} onClick={() => paginate(number)}>{number}</button>
                    ))}
                    {currentPage < totalPages && <button className="join-item btn " onClick={() => paginate(currentPage + 1)}>Next</button>}
                </div>
            )}
        </>
    );
};

export default TableWithPagination;

TableWithPagination.propTypes = {
    array: PropTypes.array,
    pages: PropTypes.number,
    addMember: PropTypes.func
};