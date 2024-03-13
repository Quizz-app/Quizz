import { useEffect, useState } from "react";

import {
  getAllUsers,
  updateAdminStatus,
  updateBlockedUser,
  updateUnblockedUser,
} from "../../services/users-service";
import { deleteQuizById, getAllQuizzes } from "../../services/quiz-service";

import UserView from "./UserView";
import Button from "./Button";


const Admin = () => {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState(null);
  const [quizzes, setQuizzes] = useState(null);
  const [blocked, setBlocked] = useState(false);


  useEffect(() => {
    getAllUsers().then((result) => {
      setUsers(result.filter((user) => !user.isBlocked));
      setBlockedUsers(result.filter((user) => user.isBlocked));
    });
    getAllQuizzes().then((result) => setQuizzes(result));
  }, [blocked, quizzes]);

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
    <div className="admin-content">
      <div className="admin-header flex justify-center space-x-4">
        <Button onClick={() => setPage(1)}>Users</Button>
        <Button onClick={() => setPage(2)}>Blocked users</Button>
        <Button onClick={() => setPage(3)}>Quizzes</Button>
      </div>
      <br />
      <br />
      <div className="admin-main">
        {page === 1 && (
          <div className="admin-page">
            <table className="w-full">
              <thead className="admin">
                <tr>
                  <th className="username">Username: </th>
                  <th className="email">Email address: </th>
                  <th className="admin">Admin: </th>
                  <th className="blocked">Block user: </th>
                </tr>
              </thead>
              <tbody className="id2">
                {users?.map((user) => (
                  <UserView
                    key={user.id}
                    text={"Block"}
                    user={user}
                    handleBlock={handleBlock}
                    changeAdminStatus={changeAdminStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {page === 2 && (
          <div className="admin-page">
            <table className="w-full">
              <thead style={{ paddingBottom: "20px" }}>
                <tr>
                  <th>User name: </th>
                  <th>Email: </th>
                  <th>Admin: </th>
                  <th>Unblock user: </th>
                </tr>
              </thead>
              <tbody className="id1">
                {blockedUsers?.map((user) => (
                  <UserView
                    key={user.id}
                    text={"Unblock"}
                    user={user}
                    handleBlock={handleUnblock}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
        {page === 3 && (
          <div className="admin-page">
            <h1 className="text-2xl font-bold mb-4 font-serif mb-3"></h1>
            <table className="w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Creator</th>
                  <th>Created on</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {quizzes?.map((quiz) => (
                  <tr key={quiz.id} className="id">
                    <td>{quiz.title}</td>
                    <td>{quiz.creator}</td>
                    <td>{quiz.createdOn}</td>

                    <td>
                      <Button onClick={() => handleDeleteQuiz(quiz.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="admin-footer"></div>
    </div>
  );
};

export default Admin;
