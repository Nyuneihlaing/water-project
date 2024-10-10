import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalculatePage from './pages/calculatePage';

function App() {
  return (
    <Router>
      <div>
        <Routes>
        <Route path="/" element={<CalculatePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
