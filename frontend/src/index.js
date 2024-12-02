import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Main from './pages/main';  // Correct import to Main.js or Main.jsx
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
