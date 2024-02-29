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
    <div className="hero min-h-screen bg-base-200 flex flex-col">
      <h2 className="text-2xl font-bold mb-4 flex-col">Profile details</h2>
      <p>
        Update your information.If your email address changes, we&apos;ll send
        you a confirmation message.
      </p>

      <div className="hero-content basis-1/4"></div>

      <div className="hero-content basis-3/4 flex flex-row">
        <div className="flex flex-col basis-1/2 mb-5">
          <div className="avatar relative mb-4">
            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                className="object-cover rounded-full"
              />
            </div>
            <button className="btn btn-primary text-xs py-1 px-2 absolute bottom-0 right-0 mb-1 mr-2">
              Change photo
            </button>
            {/* <button className="btn btn-primary text-xs absolute bottom-0 right-0 mb-2 mr-2">
              Change photo
            </button> */}
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
        </div>

        <div className="flex flex-col basis-1/2 mb-5">
          <h2>About me</h2>
          <textarea
            className="textarea textarea-bordered mb-4"
            placeholder="Write something about you..."
          ></textarea>
          <div className="form-control">
            <label htmlFor="currentPassword">
              <span className="label-text">Current password</span>
            </label>
            <input
              // onChange={(e) => setCurrentPassword(e.target.value)}
              type="password"
              placeholder="Current password"
              name="currentPassword"
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label htmlFor="email">
              <span className="label-text">New password</span>
            </label>
            <input
              // value={form.password}
              // onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              name="password"
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label htmlFor="password">
              <span className="label-text">Confirm password</span>
            </label>
            <input
              // value={form.password}
              // onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              name="password"
              className="input input-bordered"
            />
          </div>
        </div>
      </div>
      <div className="form-control mt-6">
        <button onClick={saveChanges} className="btn btn-primary">
          Save changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
