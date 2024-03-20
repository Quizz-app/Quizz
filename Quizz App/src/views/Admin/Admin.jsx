import { useEffect, useState } from "react";
import {
  getAllUsers,
  updateAdminStatus,
  updateBlockedUser,
  updateUnblockedUser,
} from "../../services/users-service";
import { deleteQuizById, getAllQuizzes } from "../../services/quiz-service";
import UserView from "./UserView";
import { Input } from "../../components/ui/input";
import { motion } from 'framer-motion';

const Admin = () => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [quizzes, setQuizzes] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [blockedUsersCurrentPage, setBlockedUsersCurrentPage] = useState(1);
  const [quizzesCurrentPage, setQuizzesCurrentPage] = useState(1);
  const itemsPerPage = 7;


  useEffect(() => {
    const unsubscribeFromUsers = getAllUsers((result) => {
      const filteredUsers = result.filter((user) =>
        !user.isBlocked && user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setUsers(filteredUsers);

      const filteredBlockedUsers = result.filter((user) =>
        user.isBlocked && user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBlockedUsers(filteredBlockedUsers);
    });

    const unsubscribeFromQuizzes = getAllQuizzes((quizzes) => {
      const filteredQuizzes = quizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setQuizzes(filteredQuizzes);
    });

    return () => {
      if (typeof unsubscribeFromUsers === 'function') {
        unsubscribeFromUsers();
      }
      if (typeof unsubscribeFromQuizzes === 'function') {
        unsubscribeFromQuizzes();
      }
    };
  }, [searchTerm]);

  const handleBlock = (userHandle) => {
    updateBlockedUser(userHandle).then(() => setBlocked(!blocked));
  };

  const handleUnblock = (userHandle) => {
    updateUnblockedUser(userHandle).then(() => setBlocked(!blocked));
  };

  const handleDeleteQuiz = (quizID) => {
    deleteQuizById(quizID);
  };

  const changeAdminStatus = (userHandle) => {
    updateAdminStatus(userHandle).then(() => setBlocked(!blocked));
  };


  const usersTotalPages = Math.ceil(users?.length / itemsPerPage);
  const blockedUsersTotalPages = Math.ceil(blockedUsers?.length / itemsPerPage);
  const quizzesTotalPages = Math.ceil(quizzes?.length / itemsPerPage);

  const currentUsers = users?.slice((usersCurrentPage - 1) * itemsPerPage, usersCurrentPage * itemsPerPage);
  const currentBlockedUsers = blockedUsers?.slice((blockedUsersCurrentPage - 1) * itemsPerPage, blockedUsersCurrentPage * itemsPerPage);
  const currentQuizzes = quizzes?.slice((quizzesCurrentPage - 1) * itemsPerPage, quizzesCurrentPage * itemsPerPage);

  const paginateUsers = pageNumber => setUsersCurrentPage(pageNumber);
  const paginateBlockedUsers = pageNumber => setBlockedUsersCurrentPage(pageNumber);
  const paginateQuizzes = pageNumber => setQuizzesCurrentPage(pageNumber);

  return (
    <div className="overflow-x-auto mt-10 mb-5">
      <table className="table">
        <div className="admin-header flex justify-center space-x-4">
          <button
            className={`font-bold ${page === 1 ? 'text-blue-500' : ''}`}
            onClick={() => setPage(1)}
          >
            Users
          </button>
          <button
            className={`font-bold ${page === 2 ? 'text-blue-500' : ''}`}
            onClick={() => setPage(2)}
          >
            Blocked users
          </button>
          <button
            className={`font-bold ${page === 3 ? 'text-blue-500' : ''}`}
            onClick={() => setPage(3)}
          >
            Quizzes
          </button>
        </div>
        <div className="flex justify-center mt-10">
          <Input
            className="input input-bordered w-80 h-10"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <br />
        <br />
        <div className="admin-main">
          {page === 1 && (
            <div className="admin-page">
              <table className="w-full mb-2 pr-24 text-center">
                <thead className="mb-2 pr-24 text-center">
                  <tr>
                    <th></th>
                    <th className="username">Username: </th>
                    <th className="email">Email: </th>
                    <th className="admin">Admin: </th>
                    <th className="blocked">Block user: </th>
                  </tr>
                </thead>
                <tbody className="mb-2 pr-24 text-center">

                  {currentUsers?.map((user, index) => (
                    <UserView
                      key={user.id}
                      text={"Block"}
                      user={user}
                      handleBlock={handleBlock}
                      changeAdminStatus={changeAdminStatus}
                      lineNumber={index + 1}
                    />
                  ))}

                </tbody>
              </table>
              {usersTotalPages > 1 && (
                <div className="justify-center flex mt-5 mb-5">
                  <div className="divider"></div>
                  {usersCurrentPage > 1 &&
                    <button className="join-item btn btn-outline mr-2" onClick={() => paginateUsers(usersCurrentPage - 1)}>Previous</button>
                  }
                  {Array.from({ length: usersTotalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      className={`join-item btn mr-2 ${number === usersCurrentPage ? 'btn bg-gradient-to-r from-cyan-500 to-blue-500' : ''}`}
                      onClick={() => paginateUsers(number)}
                    >
                      {number}
                    </button>
                  ))}
                  {usersCurrentPage < usersTotalPages &&
                    <button className="join-item btn " onClick={() => paginateUsers(usersCurrentPage + 1)}>Next</button>
                  }
                </div>
              )}
            </div>
          )}
          {page === 2 && (
            <div className="admin-page">
              <table className="w-full mb-2 pr-24 text-center">
                <thead className="mb-2 pr-24 text-center">
                  <tr>
                    <th></th>
                    <th>Username: </th>
                    <th>Email: </th>
                    <th>Admin: </th>
                    <th>Unblock user: </th>
                  </tr>
                </thead>
                <tbody className="mb-2 pr-24 text-center">
                  {currentBlockedUsers?.map((user, index) => (
                    <UserView
                      key={user.id}
                      text={"Unblock"}
                      user={user}
                      handleBlock={handleUnblock}
                      lineNumber={index + 1}
                    />
                  ))}
                </tbody>
              </table>
              {blockedUsersTotalPages > 1 && (
                <div className="justify-center flex mt-5 mb-5">
                  <div className="divider"></div>
                  {blockedUsersCurrentPage > 1 &&
                    <button className="join-item btn btn-outline mr-2" onClick={() => paginateBlockedUsers(blockedUsersCurrentPage - 1)}>Previous</button>
                  }
                  {Array.from({ length: blockedUsersTotalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      className={`join-item btn mr-2 ${number === blockedUsersCurrentPage ? 'btn bg-gradient-to-r from-cyan-500 to-blue-500' : ''}`}
                      onClick={() => paginateBlockedUsers(number)}
                    >
                      {number}
                    </button>
                  ))}
                  {blockedUsersCurrentPage < blockedUsersTotalPages &&
                    <button className="join-item btn " onClick={() => paginateBlockedUsers(blockedUsersCurrentPage + 1)}>Next</button>
                  }
                </div>
              )}
            </div>
          )}
          {page === 3 && (
            <div className="admin-page">
              <h1 className="text-2xl font-bold mb-4 font-serif mb-3"></h1>
              <table className="w-full mb-2 pr-24 text-center">
                <thead className="mb-2 pr-40 text-center">
                  <tr>
                    <th></th>
                    <th>Title: </th>
                    <th>Creator: </th>
                    <th>Created on: </th>
                    <th>Delete: </th>
                  </tr>
                </thead>
                <tbody className="mb-2 pr-24 text-center">
                  {currentQuizzes?.map((quiz, index) => (
                    <tr key={quiz.id} className="">
                      <td>{index + 1}</td>
                      <td>{quiz.title}</td>
                      <td>{quiz.creator}</td>
                      <td>{new Date(quiz.createdOn).toLocaleDateString()}</td>
                      <td>
                        <motion.button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="shadow-[0_4px_14px_0_rgb(0,118,255,39%)] hover:shadow-[0_6px_20px_rgba(0,118,255,23%)] hover:bg-red-600 px-8 py-2 bg-red-500 rounded-md text-white font-bold transition duration-200 ease-linear "
                          initial={{ scale: 2 }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 0.5, times: [1, 0.5, 1], loop: 2, delay: 3 }}
                        >
                          Delete quiz
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quizzesTotalPages > 1 && (
                <div className="justify-center flex mt-5 mb-5">
                  <div className="divider"></div>
                  {quizzesCurrentPage > 1 &&
                    <button className="join-item btn btn-outline mr-2" onClick={() => paginateQuizzes(quizzesCurrentPage - 1)}>Previous</button>
                  }
                  {Array.from({ length: quizzesTotalPages }, (_, i) => i + 1).map(number => (
                    <button
                      key={number}
                      className={`join-item btn mr-2 ${number === quizzesCurrentPage ? 'btn bg-gradient-to-r from-cyan-500 to-blue-500' : ''}`}
                      onClick={() => paginateQuizzes(number)}
                    >
                      {number}
                    </button>
                  ))}
                  {quizzesCurrentPage < quizzesTotalPages &&
                    <button className="join-item btn " onClick={() => paginateQuizzes(quizzesCurrentPage + 1)}>Next</button>
                  }
                </div>
              )}
            </div>
          )}
        </div>
        <div className="admin-footer"></div>
      </table>
    </div>
  );
};

export default Admin;
