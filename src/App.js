import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import {Login } from './Login';
import Nav from './Nav';
import Home from './Home';
import { LoginProvider } from './context/LoginContext';

function App() {
  return (
    <LoginProvider>
    <Router>
      <div className='App'>
        <Nav />
        <Routes>
          <Route path="/"  element={<Home />}  />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
    </LoginProvider>
  );
}

export default App;
