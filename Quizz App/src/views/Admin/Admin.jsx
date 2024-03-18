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

const Admin = () => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [quizzes, setQuizzes] = useState(null);
  const [blocked, setBlocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


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

  return (
    <div className="overflow-x-auto">
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

                  {users?.map((user, index) => (
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
                  {blockedUsers?.map((user, index) => (
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
                  {quizzes?.map((quiz, index) => (
                    <tr key={quiz.id} className="">
                      <td>{index + 1}</td>
                      <td>{quiz.title}</td>
                      <td>{quiz.creator}</td>
                      <td>{new Date(quiz.createdOn).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-primary" onClick={() => handleDeleteQuiz(quiz.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="admin-footer"></div>
      </table>
    </div>
  );
};

export default Admin;
