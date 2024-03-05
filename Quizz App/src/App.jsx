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
import CreateTeam from './views/CreateTeam';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Link } from "react-router-dom";
import Profile from "./views/Profile";
import MyLibrary from "./views/MyLibrary";
import MyTeamsView from "./views/MyTeamsView";
import Assistant from "./views/Assistant";

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

  return (user ? (
    <BrowserRouter>
      <AppContext.Provider value={{ ...context, setContext }}>
        <Header theme={theme} onThemeChange={handleThemeChange} />

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-full max-w-full"   //{/* if you want a border add  - rounded-lg border */ }
        >
          <ResizablePanel defaultSize={25}>
            <div className="flex h-full items-start justify-start p-6 flex-col">
              <Link to="/home" className="font-semibold mb-2">Dashboard</Link>
              <Link to="/my-library" className="font-semibold mb-2">Library</Link>
              <Link to="/my-teams" className="font-semibold mb-2">Teams</Link>
              <Link to="/classrooms" className="font-semibold mb-2">Classrooms</Link>
              <Link to="/statistics" className="font-semibold mb-2">Statistics</Link>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex flex-col h-full items-start justify-start p-6 ">
              <Routes>
                <Route index element={<Home />} />
                <Route path="/home" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/my-library" element={<MyLibrary />} />
                <Route path="/my-teams" element={<MyTeamsView />} />
                <Route path="/quiz/:id" element={<CreateQuiz />} />
                <Route path="/team/:id" element={<CreateTeam />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/assistant" element={<Assistant />} />
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
  )
  );
};

export default App;
