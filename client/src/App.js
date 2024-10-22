import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalculatePage from './pages/calculatePage';
import HistoryPage from './pages/historyPage';
import OptionsPage from './pages/optionsPage';
import MenuBar from './components/Menubar';

function App() {
  return (
    <Router>
      <div>
        <MenuBar />

        <Routes>
          <Route path="/" element={<CalculatePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/options" element={<OptionsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
