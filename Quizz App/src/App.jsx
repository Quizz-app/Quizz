import { useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { useAuthState } from 'react-firebase-hooks/auth';
import Register from "./views/Register";
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { auth } from "./config/firebase-config";
import { getUserData } from "./services/users-service";
import Home from "./views/Home";
import Login from "./views/Login";
import Header from "./components/Header";


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
        <Header />
        <div className="min-h-screen flex-nowrap">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </AppContext.Provider>
    </BrowserRouter>
  );
};

//delete this line

export default App;
