import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/auth-service";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";

const Header = ({ theme, onThemeChange }) => {
  const { user, setContext, userData } = useContext(AppContext);
  console.log(userData?.avatar);

  const [form, setForm] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
    role: userData?.role || "",
    avatar: userData?.avatar || "",
    password: userData?.password || "",
  });

  useEffect(() => {
    setForm({
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      role: userData?.role || "",
      avatar: userData?.avatar || "",
      password: userData?.password || "",
    });
  }, [userData]);
  const navigate = useNavigate();

  const logOut = async () => {
    await logoutUser();
    setContext({ user: null, userData: null });
    navigate("/");
  };

  const isChecked = theme === "synthwave";

  const handleClick = () => {
    onThemeChange({ target: { checked: !isChecked } });
  };

  return (
    <div className="navbar bg-base-100 flex justify-between">
      <div className="flex-2">
        <a className="btn btn-ghost text-xl" onClick={() => navigate("/")}>
          BrainBurst
        </a>
        <label className="flex cursor-pointer gap-2" onClick={handleClick}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <input
            type="checkbox"
            value="synthwave"
            className="toggle theme-controller"
            checked={isChecked}
            readOnly
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>
      </div>

      {/* //search bar */}
      <div className="form-control flex justify-center w-3/4">
        <input
          type="text"
          placeholder="Search"
          className="input input-bordered w-96"
        />
      </div>

      {/* login and register */}
      <div className="flex-none gap-2 mr-3">
        {!user ? (
          <>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-outline btn-secondary"
            >
              Log in
            </button>

            <button
              onClick={() => navigate("/register")}
              className="btn btn-outline btn-secondary"
            >
              Sign up
            </button>
          </>
        ) : (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt="Tailwind CSS Navbar component" src={form.avatar} />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <a
                  className="justify-between"
                  onClick={() => navigate("/profile")}
                >
                  Profile
                </a>
              </li>

              {user && (
                <li onClick={logOut} role="button">
                  <NavLink to="/">Logout</NavLink>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
