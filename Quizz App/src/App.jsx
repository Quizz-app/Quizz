import { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { useAuthState } from "react-firebase-hooks/auth";
import Register from "./views/Register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { auth } from "./config/firebase-config";
import { getUserData } from "./services/users-service";
import Home from "./views/Home";
import Login from "./views/Login";
import Header from "./components/Header";
import CreateQuiz from "./views/CreateQuiz";
import CreateTeam from "./views/CreateTeam";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable";
import { Link } from "react-router-dom";
import Profile from "./views/Profile";
import MyLibrary from "./views/MyLibrary";
import QuizSolve from "./components/QuizSolve";
import QuizPreview from "./components/QuizPreview";
import QuizResults from "./views/QuizResults";
import MyTeamsView from "./views/MyTeamsView";
import Admin from "./views/Admin/Admin";
import Dashboard from "./views/Dashboard";
import CreateClass from "./views/CreateClass";
import MyClassesView from "./views/MyClassesView";

const App = () => {
  const [context, setContext] = useState({
    user: null,
    userData: null,
  });

  const [user, loading, error] = useAuthState(auth);
  const [theme, setTheme] = useState("default");
  useEffect(() => {
    if (user) {
      getUserData(user.uid).then((snapshot) => {
        if (snapshot.exists()) {

          setContext({
            user,
            userData: snapshot.val()[Object.keys(snapshot.val())[0]],
          });
        }
      });

    }
  }, [user, loading, error]);

  const handleThemeChange = (event) => {
    setTheme(event.target.checked ? "synthwave" : "1");
  };

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...context, setContext }}>
        <Header theme={theme} onThemeChange={handleThemeChange} />
        <div className='min-h-screen min-w-screen'>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route index element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/my-library" element={<MyLibrary />} />
            <Route path="/my-teams" element={<MyTeamsView />} />
            <Route path="/quiz-preview/:id" element={<QuizPreview />} />
            <Route path="/my-classes" element={<MyClassesView />} />
            <Route path="/quiz-solve/:id" element={<QuizSolve />} />
            <Route path="/team/:id" element={<CreateTeam />} />
            <Route path="/class/:id" element={<CreateClass />} />
            <Route path="/quiz/:id" element={<CreateQuiz />} />
            <Route path="/results/:id" element={<QuizResults />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={context.userData?.isAdmin ? <Admin /> : <Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;
