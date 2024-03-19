import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { loginUser } from "../services/auth-service";
import { toast } from "react-hot-toast";
import { emailPattern } from "../constants/constants";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { Input } from ".././components/ui/input";
import LabelInputContainer from "../components/ui/LabelInputContainer";
import { Label } from "@radix-ui/react-label";
import { BottomGradient } from "./Register";
import { motion, AnimatePresence } from "framer-motion";

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
      toast.error("Please ensure you've entered a valid email in the Email address field and try again.");
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

    // if (!emailPattern.test(form.email) && form.password.length < 6) {
    //   return toast.error("Incorrect email or password. Please try again.");
    // }

    try {
      const credentials = await loginUser(form.email, form.password);
      setContext({ user: credentials.user, userData: null });
    } catch (err) {
      console.log(err.message);
      if (err.code === "auth/user-not-found" || err.code === "auth/missing-password") {
        return toast.error("Wrong email or password.");
      }
    }
  };

  return (

    <AnimatePresence mode='wait'>
      <motion.div
        initial={{ opacity: 0, x: -200 }} // Starts from the left
        animate={{ opacity: 1, x: 0 }} // Moves to the center
        exit={{ opacity: 0, x: 200 }} // Exits to the right
        transition={{ duration: 0.9 }}
      >

        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
          <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 mb-5">
            Welcome to BrainBurst
          </h2>
          <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-5">
            Unlock your potential with each quiz. Start your adventure in learning now!
          </p>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" placeholder="your-email-here@bb.com" type="email" value={form.email} onChange={updateForm("email")} />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" placeholder="••••••••" type="password" value={form.password} onChange={updateForm("password")} />
            <label className="label">
              <a href="#" className="label-text-alt link link-hover" onClick={forgotPassword}>Forgot password?</a>
            </label>

          </LabelInputContainer>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 justify-center items-center">
          </div>

          <button
            className=" mt-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            onClick={login}
          >
            Login &rarr;
            <BottomGradient />
          </button>
          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        </div>

      </motion.div>
    </AnimatePresence>

  );
};

export default Login;

