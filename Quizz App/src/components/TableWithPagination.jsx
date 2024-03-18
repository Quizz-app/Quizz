import { useState } from "react";
import PropTypes from 'prop-types';

export const TableWithPagination = ({ array, pages, addMember, buttonText }) => {

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
                        <th>Username</th>

                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {currentArray.map((member, index) =>
                        <>
                            <tr key={index}>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-12 h-12">
                                                <img src={member?.avatar} />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {member?.username}
                                    <br />
                                    <span className="badge badge-ghost badge-sm">{member?.role}</span>
                                </td>
                                <td>{member?.email}</td>
                                <th>
                                    <button onClick={() => addMember(member)} className="btn btn-xs">{buttonText}</button>
                                </th>
                            </tr>
                        </>
                    )}
                </tbody>
            </table>
            {totalPages > 1 && (
                <div className="justify-center flex mt-5 mb-5">
                    <div className="divider"></div>
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
    addMember: PropTypes.func,
    buttonText: PropTypes.string

};