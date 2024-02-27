import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { createUsername, getUserByUsername } from "../services/users-service";
import { registerUser } from "../services/auth-service";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { setContext } = useContext(AppContext);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const updateForm = (prop) => (e) => {
    setForm({
      ...form,
      [prop]: e.target.value,
    });
  };

  const register = async () => {
    try {
      const user = await getUserByUsername(form.username);
      if (user.exists()) {
        return alert(`Потребителско име @${form.username} вече съществува!`);
      }
      const credentials = await registerUser(form.email, form.password);
      await createUsername(
        form.firstName,
        form.lastName,
        form.username,
        credentials.user.uid,
        form.email,
        form.role
      );

      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative w-full flex flex-col justify-center h-screen overflow-hidden">
      <div className="w-full p-6 m-auto bg-gray border border-amber-950 rounded-md shadow-2xl shad ring-2 ring-white lg:max-w-xl">
        <h1 className="text-3xl font-semibold text-center text-gray-700">
          Sign Up
        </h1>
        <br />
        {step === 1 && (
          <>
            <div className="mb-7">
              <label htmlFor="username"></label>

              <input
                className="w-full input input-bordered"
                value={form.username}
                onChange={updateForm("username")}
                type="text"
                placeholder="Username"
              ></input>
            </div>
            <div className="mb-7">
              <label htmlFor="email"></label>

              <input
                className="w-full input input-bordered"
                value={form.email}
                onChange={updateForm("email")}
                type="text"
                placeholder="name@example.com"
              ></input>
            </div>

            <div className="mb-7">
              <button
                className="btn btn-ghost btn-circle avatar bg-base-200 w-full border-2 border-amber-950"
                onClick={() => setStep(2)}
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <button
                className="btn btn-ghost btn-circle avatar bg-base-200 w-full"
                onClick={() => {
                  setForm({ ...form, role: "student" });
                  setStep(3);
                }}
              >
                Student
              </button>
            </div>

            <div>
              <button
                className="btn btn-ghost btn-circle avatar bg-base-200 w-full"
                onClick={() => {
                  setForm({ ...form, role: "teacher" });
                  setStep(4);
                }}
              >
                Teacher
              </button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <label htmlFor="age">Age</label>
            <input
              className="w-full input input-bordered"
              value={form.age}
              onChange={updateForm("age")}
              type="text"
            ></input>

            <button
              className="btn btn-ghost btn-circle avatar bg-base-200 w-full"
              onClick={() => setStep(4)}
            >
              Continue
            </button>
          </>
        )}
        {step === 4 && (
          <>
            <label htmlFor="firstName">First Name</label>
            <input
              className="w-full input input-bordered"
              value={form.firstName}
              onChange={updateForm("firstName")}
              type="text"
            ></input>

            <label htmlFor="lastName">Last Name</label>
            <input
              className="w-full input input-bordered"
              value={form.lastName}
              onChange={updateForm("lastName")}
              type="text"
            ></input>

            <label htmlFor="password">Password</label>
            <input
              className="w-full input input-bordered"
              value={form.password}
              onChange={updateForm("password")}
              type="password"
            ></input>

            <button
              className="btn btn-ghost btn-circle avatar bg-base-200 w-full"
              onClick={register}
            >
              Register
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
