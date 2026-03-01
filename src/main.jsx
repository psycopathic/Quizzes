import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import QuizHolder from './context/QuizHolder';
import { VoiceProvider } from './context/VoiceContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QuizHolder>
      <VoiceProvider>
        <App />
      </VoiceProvider>
    </QuizHolder>
  </React.StrictMode>
);