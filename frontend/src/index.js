import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // содержит body[data-theme='dark'] стили
import App from './App';
import store from './redux/store';
import { Provider } from 'react-redux';
// import './i18n'; // если будешь использовать локализацию, раскомментируй

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
