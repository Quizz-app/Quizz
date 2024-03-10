import { useState } from "react";

import {
  createUsername,
  getUserByUsername,
  verifyUser,
} from "../services/users-service";
import { registerUser } from "../services/auth-service";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  emailPattern,
  namePattern,
  usernamePattern,
} from "../constants/constants";
import { auth } from "../config/firebase-config";
import { fetchSignInMethodsForEmail } from "firebase/auth";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // const username = form.username;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1);

  const navigate = useNavigate();

  const checkEmailExists = async (email) => {
    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        console.log("The email address is already in use by another account.");
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
    }
  };

  const updateForm = (prop) => (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      [prop]: value,
    });

    if (prop === "username") {
      setUsername(value);
    }
    if (prop === "email") {
      setEmail(value);
    }

    if (prop === "firstName") {
      setFirstName(value);
    }

    if (prop === "lastName") {
      setLastName(value);
    }

    if (prop === "password") {
      setPassword(value);
    }

    if (prop === "confirmPassword") {
      setConfirmPassword(value);
    }
  };

  const continueButton = async () => {
    const user = await getUserByUsername(form.username);

    try {
      if (!username.length) {
        return toast.error(`Username is required!`);
      } else if (!usernamePattern.test(username)) {
        return toast.error(`Username does not match the required format!`);
      } else if (user.exists()) {
        return toast.error(`Username ${username} already exists!`);
      }

      if (await checkEmailExists(email)) {
        return toast.error(`Email ${email} already exists!`);
      } else if (!email.length) {
        return toast.error(`Email is required!`);
      } else if (!emailPattern.test(email)) {
        return toast.error(`Email does not match the required format!`);
      }

      setStep(2);
    } catch (error) {
      console.log(error);
      // toast.error(`An error occurred: ${error.message}`);
    }
  };

  const register = async () => {
    console.log(firstName);

    if (!firstName.length) {
      return toast.error(`First name is required!`);
    } else if (!namePattern.test(firstName)) {
      return toast.error(`First name does not match the required format!`);
    }

    if (!lastName.length) {
      return toast.error(`Last name is required!`);
    } else if (!namePattern.test(lastName)) {
      return toast.error(`Last name does not match the required format!`);
    }

    if (!password.length) {
      return toast.error(`Password is required!`);
    } else if (password.length < 8) {
      return toast.error("Password must be at least 8 characters long!");
    }

    if (password !== confirmPassword) {
      return toast.error(
        "Please ensure the password and confirm password fields are the same!"
      );
    }

    try {
      const credentials = await registerUser(form.email, form.password);
      await verifyUser(credentials.user);
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
                onClick={continueButton}
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
        {/* {step === 3 && (
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
        )} */}
        {step === 3 && (
          <>
            <label htmlFor="firstName">First name</label>
            <input
              className="w-full input input-bordered"
              value={form.firstName}
              onChange={updateForm("firstName")}
              type="text"
            ></input>

            <label htmlFor="lastName">Last name</label>
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

            <label htmlFor="password">Confirm password</label>
            <input
              className="w-full input input-bordered"
              value={form.confirmPassword}
              onChange={updateForm("confirmPassword")}
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
