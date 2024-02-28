import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { updateUserInfo } from "../services/users-service";

const Profile = () => {
  const { setContext, userData } = useContext(AppContext);
  const [form, setForm] = useState({
    firstName: userData?.firstName,
    lastName: userData?.lastName,
    email: userData?.email,
    password: "",
    role: "",
  });

  const navigate = useNavigate();

  const updateForm = (prop) => (e) => {
    setForm({ ...form, [prop]: e.target.value });
    // setError("");
  };

  const saveChanges = async () => {
    await updateUserInfo(userData.username, "firstName", form.firstName);
    await updateUserInfo(userData.username, "lastName", form.lastName);
    await updateUserInfo(userData.username, "email", form.email);

    navigate("/home");
  };

  console.log(userData);
  return (
    <div>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left"></div>
          <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <h2 className="text-center text-2xl">Profile</h2>
              <div className="form-control">
                <label htmlFor="email">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  value={userData.username}
                  readOnly
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label htmlFor="name">
                  <span className="label-text">First name</span>
                </label>
                <input
                  value={form.firstName}
                  onChange={updateForm("firstName")}
                  type="text"
                  name="firstName"
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label htmlFor="name">
                  <span className="label-text">Last name</span>
                </label>
                <input
                  value={form.lastName}
                  onChange={updateForm("lastName")}
                  type="text"
                  name="lastName"
                  className="input input-bordered"
                />
              </div>

              <div className="form-control">
                <label htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input
                  value={form.email}
                  onChange={updateForm("email")}
                  type="email"
                  placeholder="email"
                  name="email"
                  className="input input-bordered"
                />
              </div>

              {/* // User can be able to change a password */}

              {/* <div className="form-control">
                <label htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <input
                  value={userData.email}
                  onChange={handleInputChange}
                  type="password"
                  placeholder="email"
                  className="input input-bordered"
                />
              </div> */}
              <div className="form-control mt-6">
                <button onClick={saveChanges} className="btn btn-primary">
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
