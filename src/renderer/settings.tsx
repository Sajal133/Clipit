import React from 'react';
import ReactDOM from 'react-dom/client';
import SettingsComponent from './SettingsComponent';
import './settings-styles.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <SettingsComponent />
    </React.StrictMode>
);
