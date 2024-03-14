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


  //console.log(quizInvites)
  return (
    <div className="navbar bg-base-100 flex justify-between">

      {/* HEADER DROPDOWN */}
      <div className="dropdown">
        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
        </div>
        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
          <li> <Link to="/dashboard" className="font-semibold mb-2"> Dashboard </Link></li>
          <li><Link to="/my-library" className="font-semibold mb-2"> Library </Link></li>

          {userData && userData.role === 'teacher'
           ?
           (<><li><Link to="/my-teams" className="font-semibold mb-2">Teams</Link></li>
           <li><Link to="/my-classes" className="font-semibold mb-2">Classes</Link></li></>)
          :
          (<li><Link to="/my-classes" className="font-semibold mb-2">Classes</Link></li>)}

        </ul>
      </div>


      <div className="flex-2">
        <a className="btn btn-ghost text-xl" onClick={() => navigate("/")}>BrainBurst</a>
        <label className="flex cursor-pointer gap-2" onClick={handleClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <input type="checkbox" value="synthwave" className="toggle theme-controller" checked={isChecked} readOnly />
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>
      </div>

      {/* //search bar */}
      {/* <div className="form-control flex justify-center w-3/4">
        <input type="text" placeholder="Search" className="input input-bordered w-96" />
      </div> */}

      {/* login and register */}
      <div className="flex-none gap-2 mr-3">
        {!user ? (
          <>
            <button onClick={() => navigate("/login")} className="btn btn-outline btn-secondary">Log in</button>
            <button onClick={() => navigate("/register")} className="btn btn-outline btn-secondary">Sign up</button>
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

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img alt="Tailwind CSS Navbar component" src={userData?.avatar} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li>
                  <a className="justify-between" onClick={() => navigate("/profile")}>Profile</a>
                </li>
                {user && (
                  <li onClick={logOut} role="button"><NavLink to="/">Logout</NavLink></li>
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