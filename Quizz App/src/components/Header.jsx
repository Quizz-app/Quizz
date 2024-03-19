import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth-service";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { getUserClassInvites, getUserQuizInvites, getUserTeamInvites, respondToClassInvite, respondToQuizInvite, respondToTeamInvite } from "../services/users-service";
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";


const Header = ({ theme, onThemeChange }) => {
  const { user, setContext, userData } = useContext(AppContext);
  const [teamInvites, setTeamInvites] = useState([]);
  const [quizInvites, setQuizInvites] = useState([]);
  const [classInvites, setClassInvites] = useState([]);
  const navigate = useNavigate();
  const isChecked = theme === "synthwave";
  const [userAvatar, setUserAvatar] = useState(userData?.avatar);


  useEffect(() => {
    if (userData && userData.username) {
      getUserTeamInvites(userData.username, (invites) => {
        setTeamInvites(Object.values(invites));
      });
    }
  }, [userData]);

  useEffect(() => {
    if (userData && userData.username) {
      getUserQuizInvites(userData.username, (invites) => {
        setQuizInvites(Object.values(invites));
      });
    }
  }, [userData]);

  useEffect(() => {
    if (userData && userData.username) {
      getUserClassInvites(userData.username, (invites) => {
        setClassInvites(Object.values(invites));
      });
    }
  }, [userData])

  useEffect(() => {
    setUserAvatar(userData?.avatar);
  }, [userData]);

  const logOut = async () => {
    await logoutUser();
    setContext({ user: null, userData: null });
    navigate("/");
  };
  const handleClick = () => {
    onThemeChange({ target: { checked: !isChecked } });
  };

  const handleInviteResponse = async (teamId, accept) => {
    respondToTeamInvite(userData.username, teamId, accept);
  }

  const handleQuizInviteResponse = async (quizId, accept) => {
    respondToQuizInvite(userData.username, quizId, accept);
  }

  const handleClassInviteResponse = async (classId, accept) => {
    respondToClassInvite(userData.username, classId, accept);
  }



  return (
    <div className="navbar bg-base-100 flex justify-between">
      <div className="flex-2">
        <h1 className="text-2xl text-center font-bold ml-5 cursor-pointer" onClick={() => navigate("/")}>Brain</h1>
        <h1 className="text-2xl text-center font-bold text-blue-500 cursor-pointer" onClick={() => navigate("/")}>Burst .</h1>
      </div>
      {userData && (
        <div>
          <div className="flex items-center justify-center ">
            <Link to="/home" className="font-semibold mb-4 mr-8">  Homeview </Link>
            <Link to="/dashboard" className="font-semibold mb-4 mr-8">  Dashboard </Link>
            <Link to="/my-library" className="font-semibold mb-4 mr-8"> Library </Link>
            {userData.role === 'teacher' ? (
              <>
                <Link to="/my-teams" className="font-semibold mb-4 mr-8">Teams</Link>
                <Link to="/my-classes" className="font-semibold mb-4 mr-8">Classes</Link>
              </>
            ) : (
              <Link to="/my-classes" className="font-semibold mb-4 mr-15">Classes</Link>
            )}
          </div>
        </div>
      )}
      <div className="flex-none gap-2 mr-3">
        {!user ? (
          <>
            <button onClick={() => navigate("/login")} className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              Sign in
            </button>
          </>
        ) : (
          <>
            {userData?.role === 'teacher' && teamInvites.length > 0 && (
              <div className="indicator">
                <span className="indicator-item badge badge-secondary">
                  {teamInvites.length}
                </span>
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button" className="btn m-1">Notifications
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      {teamInvites.map((invite, index) => (
                        <li key={index}>
                          <div className="flex flex-col">
                            <p>
                              You have an invitation from {invite.inviter} for team {invite.teamName}
                            </p>
                            <div className="flex flex-row justify-between">
                              <button className="btn btn-xs mr-3" onClick={() => handleInviteResponse(invite.teamId, true)}>Accept</button>
                              <button className="btn btn-xs ml-3" onClick={() => handleInviteResponse(invite.teamId, false)}>Decline</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {userData?.role === 'student' && quizInvites.length > 0 && (
              <div className="indicator">
                <span className="indicator-item badge badge-secondary">
                  {quizInvites.length}
                </span>
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button" className="btn m-1">Notifications
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      {quizInvites.map((invite, index) => (
                        <li key={index}>
                          <div className="flex flex-col">
                            <p>
                              You have an invitation from {invite.inviter} for quiz {invite.quizTitle}
                            </p>
                            <div className="flex flex-row justify-between">
                              <button className="btn btn-xs mr-3" onClick={() => handleQuizInviteResponse(invite.quizId, true)}>Accept</button>
                              <button className="btn btn-xs ml-3" onClick={() => handleQuizInviteResponse(invite.quizId, false)}>Decline</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {userData?.role === 'student' && classInvites.length > 0 && (
              <div className="indicator">
                <span className="indicator-item badge badge-secondary">
                  {classInvites.length}
                </span>
                <div className="dropdown dropdown-bottom dropdown-end">
                  <div tabIndex={0} role="button" className="btn m-1">Notifications
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      {classInvites.map((invite, index) => (
                        <li key={index}>
                          <div className="flex flex-col">
                            <p>
                              You have an invitation from {invite.inviter} for class {invite.className}
                            </p>
                            <div className="flex flex-row justify-between">
                              <button className="btn btn-xs mr-3" onClick={() => handleClassInviteResponse(invite.classId, true)}>Accept</button>
                              <button className="btn btn-xs ml-3" onClick={() => handleClassInviteResponse(invite.classId, false)}>Decline</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <label className="swap swap-rotate">
              {/* this hidden checkbox controls the state */}
              <input type="checkbox" className="theme-controller" value="synthwave" />
              {/* sun icon */}
              <svg className="swap-off fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>
              {/* moon icon */}
              <svg className="swap-on fill-current w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>
            </label>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img alt="Tailwind CSS Navbar component" src={userAvatar} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                {user && (
                  <>
                    {userData?.isAdmin ? (
                      <>
                        <li><a className="justify-between" onClick={() => navigate("/profile")}>Profile</a></li>
                        <li><a className="justify-between" onClick={() => navigate("/admin")}>Admin</a></li>
                      </>
                    ) : (
                      <li><a className="justify-between" onClick={() => navigate("/profile")}>Profile</a></li>
                    )}
                    <li onClick={logOut} role="button"><NavLink to="/">Logout</NavLink></li>
                  </>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Header;

Header.propTypes = {
  theme: PropTypes.string,
  onThemeChange: PropTypes.func
};