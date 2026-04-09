import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '../utils/auth';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        const token = getToken();
        if (!token) return;

        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        // Implement mark all as read if backend supports it, otherwise loop markAsRead
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        for (const id of unreadIds) {
            await markAsRead(id);
        }
    };

    const generateReminders = async () => {
        const token = getToken();
        if (!token) return;

        try {
            await axios.post('http://localhost:5000/api/notifications/reminders', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // After generating, fetch the new notifications
            fetchNotifications();
        } catch (error) {
            console.error('Failed to generate reminders:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            loading, 
            fetchNotifications, 
            markAsRead,
            markAllAsRead,
            generateReminders
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
