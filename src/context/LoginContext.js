import { createContext, useState } from 'react';

// set up login context
const LoginContext = createContext(null);


// Create a component that provides the context value
const LoginProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    // Function to toggle login state
    const toggleLogin = () => {
      setIsLoggedIn(!isLoggedIn);
    };
  
    // The value that will be passed to the context consumers
    const value = { isLoggedIn, toggleLogin };
  
    return (
      <LoginContext.Provider value={value}>
        {children}
      </LoginContext.Provider>
    );
  };

export { LoginProvider, LoginContext };
