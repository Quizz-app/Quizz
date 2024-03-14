import { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { createUsername } from "../services/users-service";
import { registerUser } from "../services/auth-service";
import { useNavigate } from "react-router-dom";
import { Label } from ".././components/ui/label";
import { Input } from ".././components/ui/input";
import LabelInputContainer from "../components/ui/LabelInputContainer";


const Register = () => {

  // const { setContext } = useContext(AppContext)

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });
 
  const navigate = useNavigate();

  const updateForm = (prop) => (e) => {
    const value = e.target.value;
    setForm({
      ...form,
      [prop]: value,
    });
  };

  const register = async () => {

    try {
      const credentials = await registerUser(form.email, form.password);
      await createUsername(form.firstName, form.lastName, form.username, credentials.user.uid, form.email, form.role);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200 mb-5">
        Welcome to BrainBurst
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300 mb-5">
        Login to aceternity if you can because we don&apos;t have a login flow
        yet
      </p>


      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
        <LabelInputContainer>
          <Label htmlFor="firstname">First name</Label>
          <Input id="firstname" placeholder="First name" type="text" value={form.firstName} onChange={updateForm("firstName")} />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="lastname">Last name</Label>
          <Input id="lastname" placeholder="Last name" type="text" value={form.lastName} onChange={updateForm("lastName")} />
        </LabelInputContainer>

      </div>
      <LabelInputContainer className="mb-8">
        <Label htmlFor="twitterpassword">Username</Label>
        <Input id="username" placeholder="Username" type="text" value={form.username} onChange={updateForm("username")} />
      </LabelInputContainer>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" placeholder="your-email-here@bb.com" type="email" value={form.email} onChange={updateForm("email")} />
      </LabelInputContainer>
      <LabelInputContainer className="mb-4">
        <Label htmlFor="password">Password</Label>
        <Input id="password" placeholder="••••••••" type="password" value={form.password} onChange={updateForm("password")} />
      </LabelInputContainer>
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4 justify-center items-center">
        <LabelInputContainer>
          <Label htmlFor="Teacher">Teacher</Label>
          <input
            type="radio" name="role" className="radio"
            onChange={() => setForm({ ...form, role: 'teacher' })}
          />
        </LabelInputContainer>
        <LabelInputContainer>
          <Label htmlFor="Student">Student</Label>
          <input
            type="radio" name="role" className="radio"
            onChange={() => setForm({ ...form, role: 'student' })}
          />
        </LabelInputContainer>
      </div>

      <button
        className=" mt-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
        type="submit"
        onClick={register}
      >
        Sign up &rarr;
        <BottomGradient />
      </button>
      <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

    </div>
  );
};


const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};


export default Register;
