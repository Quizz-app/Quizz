import { useContext, useState, useEffect } from "react";
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {step === 1 && (
        <>
          <label htmlFor="username">Username</label>
          <input
            value={form.username}
            onChange={updateForm("username")}
            type="text"
          ></input>

          <label htmlFor="email">Email</label>
          <input
            value={form.email}
            onChange={updateForm("email")}
            type="text"
          ></input>

          <button onClick={() => setStep(2)}>Continue</button>
        </>
      )}

      {step === 2 && (
        <>
          <button
            onClick={() => {
              setForm({ ...form, role: "student" });
              setStep(3);
            }}
          >
            Student
          </button>

          <button
            onClick={() => {
              setForm({ ...form, role: "teacher" });
              setStep(4);
            }}
          >
            Teacher
          </button>
        </>
      )}
      {step === 3 && (
        <>
          <label htmlFor="age">Age</label>
          <input
            value={form.age}
            onChange={updateForm("age")}
            type="text"
          ></input>

          <button onClick={() => setStep(4)}>Continue</button>
        </>
      )}
      {step === 4 && (
        <>
          <label htmlFor="firstName">First Name</label>
          <input
            value={form.firstName}
            onChange={updateForm("firstName")}
            type="text"
          ></input>

          <label htmlFor="lastName">Last Name</label>
          <input
            value={form.lastName}
            onChange={updateForm("lastName")}
            type="text"
          ></input>

          <label htmlFor="password">Password</label>
          <input
            value={form.password}
            onChange={updateForm("password")}
            type="password"
          ></input>

          <button onClick={register}>Register</button>
        </>
      )}
    </div>
  );
};

export default Register;
