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
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';

import { Link } from "react-router-dom";
import Teams from "./views/Teams";

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

        {user ?
          (
            <>
              <div className={`min-h-screen flex`}>
                <Sidebar className="h-screen">
                  <Menu
                    menuItemStyles={{
                      button: {
                        [`&.active`]: {
                          backgroundColor: '#13395e',
                          color: '#b6c8d9',
                        },
                      },
                    }}
                  >
                    <MenuItem component={<Link to="/home" />}> Overview</MenuItem>    {/*teacher stats */}
                    <MenuItem component={<Link to="/library" />}> Library</MenuItem>   {/*browse quizes(be able to filter them by category) - when you click on a
               quiz you see the quiz' details and deside if you should add in a workspace/classrooms - Asign to workspace , Asign to classroom*/}
                    <MenuItem component={<Link to="/create-quiz" />}> QuizCraft</MenuItem>  {/*recently created => quiz details option with option delete quiz / asign to workspace/ asign to classrom, create a quiz button, ai studio */}
                    <MenuItem component={<Link to="/my-teams" />}>Workspaces</MenuItem>
                    <MenuItem component={<Link to="/classrooms" />}>Classrooms</MenuItem>
                    <MenuItem component={<Link to="/statistics" />}>Statistcs</MenuItem>
                  </Menu>
                </Sidebar>
                <div className="flex-grow">
                  <Routes>
                    <Route index element={<Home />} />
                    <Route path="/home" element={< Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/create-quiz" element={<CreateQuiz />} />
                    <Route path="/my-teams" element={<Teams />} />
                  </Routes>
                </div>
              </div>
            </>)

          :

          (<>
            <Routes>
              <Route index element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </>)

        }

      </AppContext.Provider>
    </BrowserRouter>
  );
};

//delete this line

export default App;
