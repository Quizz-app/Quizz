import { useEffect, useState } from "react";
import "./App.css";
import { AppContext } from "./context/AppContext";
import { useAuthState } from 'react-firebase-hooks/auth';
import Register from "./views/Register";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth } from "./config/firebase-config";
import { getUserData } from "./services/users-service";
import Home from "./views/Home";


const App = () => {

  const [context, setContext] = useState({
    user: null,
    userData: null,
  });

  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      getUserData(user.uid)
        .then(snapshot => {
          if (snapshot.exists()) {
            setContext({ user, userData: snapshot.val()[Object.keys(snapshot.val())[0]] });
          }
        })
    }
  }, [user]);

  return (
    <BrowserRouter>
      <AppContext.Provider value={{ ...context, setContext }}>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/register" element={<Register />} />
        </Routes>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

export default App;
