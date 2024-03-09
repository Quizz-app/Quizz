import { useEffect, useState } from "react";
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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Link } from "react-router-dom";
import Profile from "./views/Profile";
import MyLibrary from "./views/MyLibrary";
import QuizSolve from "./components/QuizSolve";
import QuizPreview from "./components/QuizPreview";
import QuizResults from "./views/QuizResults";
import MyTeamsView from "./views/MyTeamsView";
import Assistant from "./views/Assistant";
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

  return user ? (
    <BrowserRouter>
      <AppContext.Provider value={{ ...context, setContext }}>
        <Header theme={theme} onThemeChange={handleThemeChange} />

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-full max-w-full" //{/* if you want a border add  - rounded-lg border */ }
        >
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-start justify-start p-6 flex-col">
              <Link to="/dashboard" className="font-semibold mb-2">
                Dashboard
              </Link>
              <Link to="/my-library" className="font-semibold mb-2">
                Library
              </Link>
              <Link to="/my-teams" className="font-semibold mb-2">
                Teams
              </Link>
              <Link to="/my-classes" className="font-semibold mb-2">
                Classes
              </Link>

            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div>
              <Routes>
                <Route index element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/my-library" element={<MyLibrary />} />
                <Route path="/my-teams" element={<MyTeamsView />} />
                <Route path="/quiz-preview/:id"element={<QuizPreview />}/>
                <Route path="/my-classes" element={<MyClassesView />} />
                <Route path="/quiz-solve/:id" element={<QuizSolve />} />
                <Route path="/team/:id" element={<CreateTeam />} />
                <Route path="/class/:id" element={<CreateClass />} />
                <Route path="/quiz/:id" element={<CreateQuiz />} />
                <Route path="/results/:id" element={<QuizResults />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/assistant" element={<Assistant />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </AppContext.Provider>
    </BrowserRouter>
  ) : (
    <BrowserRouter>
      <AppContext.Provider value={{ ...context, setContext }}>
        <Header theme={theme} onThemeChange={handleThemeChange} />
        <Routes>
          <Route index element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;
