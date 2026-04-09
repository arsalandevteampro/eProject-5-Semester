import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Info, Clock, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon with Badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
                aria-label="View Notifications"
            >
                <Bell size={24} className={unreadCount > 0 ? "text-blue-400 animate-pulse" : "text-gray-300"} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-black">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-50 transform origin-top-right transition-all duration-200">
                    <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <span className="animate-spin inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full"></span>
                                <p className="mt-2 text-sm">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="mx-auto mb-2 opacity-20" size={32} />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notification) => (
                                    <div 
                                        key={notification._id}
                                        className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors group relative ${!notification.isRead ? 'bg-blue-600/5' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1">
                                                {notification.message.includes('💡') ? (
                                                    <Info size={16} className="text-yellow-400" />
                                                ) : notification.message.includes('Workout') ? (
                                                    <CheckCircle size={16} className="text-green-400" />
                                                ) : notification.message.includes('Meal') ? (
                                                    <Info size={16} className="text-blue-400" />
                                                ) : (
                                                    <Clock size={16} className="text-purple-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm leading-snug ${!notification.isRead ? 'text-white font-medium' : 'text-gray-400'}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold italic">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-blue-400 hover:text-blue-300 transition-opacity"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-white/5 border-t border-white/10 text-center">
                        <button 
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/admin/settings');
                            }}
                            className="text-[10px] text-gray-500 hover:text-gray-300 font-bold uppercase tracking-[2px]"
                        >
                            Settings
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
