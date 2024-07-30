import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './output.css';

import {Login } from './components/Login';
import Nav from './components/Nav';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Contact from './components/Contact';
import { UnzipNPlot } from './components/UnzipNPlot';
import TheGraphs from './components/TheGraphs';

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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/fileupload" element={<UnzipNPlot />} />
          <Route path="/thegraphs" element={<TheGraphs />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </div>
    </Router>
    </LoginProvider>
  );
}

export default App;
