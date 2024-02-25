import { createContext } from "react";

export const AppContext = createContext({
  user: null,
  userData: null,
  setContext() {
    // real implementation comes from App.jsx
  },
});
