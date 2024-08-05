import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage'
import CreateAccountPage from './pages/createAccount';
import MainPage from './pages/latestPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path='/login' element={<LandingPage />} />
        <Route path='/createaccount' element={<CreateAccountPage />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;