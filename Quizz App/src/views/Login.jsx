import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { loginUser } from "../services/auth-service";
import { toast } from "react-hot-toast";
import { emailPattern } from "../constants/constants";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase-config";

const Login = () => {
  const { user, userData, setContext } = useContext(AppContext);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const forgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, form.email);
      return toast.success(
        "A password reset link has been sent to your email."
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to send password reset email. Please try again.");
    }
  };

  const navigate = useNavigate();
  const location = useLocation();

  const updateForm = (prop) => (e) => {
    setForm({ ...form, [prop]: e.target.value });
  };

  useEffect(() => {
    if (user && userData) {
      if (userData.role === "student") {
        navigate("/my-library");
      } else {
        navigate(location.state?.from.pathname || "/");
      }
    }
  }, [user, userData]);

  const login = async () => {
    if (!form.email) {
      return toast.error(`Email is required!`);
    } else if (!emailPattern.test(form.email)) {
      return toast.error(`Email does not match the required format!`);
    }

    if (!form.password) {
      return toast.error(`Password is required!`);
    } else if (!emailPattern.test(form.email)) {
      return toast.error(`Email does not match the required format!`);
    } else if (form.password.length < 6) {
      return toast.error("Password must be at least 8 characters long!");
    }

    try {
      const credentials = await loginUser(form.email, form.password);
      setContext({ user: credentials.user, userData: null });
    } catch (err) {
      console.log(err.message);
      if (err.code === "auth/user-not-found") {
        return toast.error("Wrong email or password.");
      }
      return toast.error("Please enter the correct password.");
    }
  };

  return (
    <div>
      {/* <h1>Login</h1>
            <input type="text" placeholder="Email" onChange={updateForm('email')} />
            <input type="password" placeholder="Password" onChange={updateForm('password')} />
            <button onClick={login}>Login</button> */}
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left"></div>
          <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <div className="form-control">
                <label htmlFor="email">
                  <span className="label-text">Email</span>
                </label>
                <input value={form.email} onChange={updateForm("email")} type="email" placeholder="email" className="input input-bordered" />
              </div>
              <div className="form-control">
                <label htmlFor="password">
                  <span className="label-text">Password</span>
                </label>
                <input value={form.password} onChange={updateForm("password")} type="password" placeholder="password" className="input input-bordered" />
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover" onClick={forgotPassword}>Forgot password?</a>
                </label>
              </div>
              <div className="form-control mt-6">
                <button onClick={login} className="btn btn-primary">Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
