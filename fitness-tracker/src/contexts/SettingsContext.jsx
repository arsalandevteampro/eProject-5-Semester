import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        notifications: {
            workoutReminders: true,
            mealReminders: true,
            progressUpdates: true,
            goalAchievements: true
        },
        units: {
            weight: 'kg',
            height: 'cm',
            distance: 'km',
            measurements: 'cm'
        },
        dailyGoals: {
            calories: 2000
        },
        privacy: {
            profileVisibility: 'public',
            progressSharing: false,
            workoutSharing: false
        },
        theme: 'dark'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const token = getToken();
            if (token) {
                try {
                    const response = await axios.get('http://localhost:5000/api/settings', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setSettings(response.data);
                } catch (error) {
                    console.log('Using local fallback for settings');
                    const savedSettings = localStorage.getItem('userSettings');
                    if (savedSettings) setSettings(JSON.parse(savedSettings));
                }
            } else {
                const savedSettings = localStorage.getItem('userSettings');
                if (savedSettings) setSettings(JSON.parse(savedSettings));
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
        
        const token = getToken();
        if (token) {
            try {
                await axios.post('http://localhost:5000/api/settings', newSettings, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (error) {
                console.error('Failed to sync settings with server');
            }
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};
