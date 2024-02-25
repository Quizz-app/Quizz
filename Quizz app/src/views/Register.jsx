import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { createUsername, getUserByUsername } from "../services/users-service";
import { registerUser } from "../services/auth-service";
// import { useNavigate } from "react-router-dom";

const Register = () => {
  const { setContext } = useContext(AppContext);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  //   const navigate = useNavigate();

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
        form.email
      );

      setContext({ user, userData: null });
      // navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <label htmlFor="username">Username</label>
      <input
        value={form.username}
        onChange={updateForm("username")}
        type="text"
      ></input>

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

      <label htmlFor="email">Email</label>
      <input
        value={form.email}
        onChange={updateForm("email")}
        type="text"
      ></input>

      <label htmlFor="password">Password</label>
      <input
        value={form.password}
        onChange={updateForm("password")}
        type="password"
      ></input>

      <button onClick={register}>Register</button>
    </div>
  );
};

export default Register;
