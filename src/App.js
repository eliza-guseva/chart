import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './output.css';

import {Login } from './components/Login';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import Contact from './components/Contact';
import { UnzipNPlot } from './components/UnzipNPlot';
import Gallery from './components/Gallery';

import { LoginProvider } from './context/LoginContext';





function App() {
  return (
    <LoginProvider>
    <Router>
      <div className='App'>
        <Nav />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/mydata" element={<UnzipNPlot />} />
          <Route path="/" element={<Gallery />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </div>
    </Router>
    </LoginProvider>
  );
}

export default App;
