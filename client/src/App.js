import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CalculatePage from './pages/calculatePage';
import HistoryPage from './pages/historyPage';
import MiscPage from './pages/miscPage';
import AnalysisPage from './pages/analysisPage';
import MenuBar from './components/Menubar';

function App() {
  return (
    <Router>
      <div>
        <MenuBar />

        <Routes>
          <Route path="/" element={<CalculatePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/misc" element={<MiscPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
