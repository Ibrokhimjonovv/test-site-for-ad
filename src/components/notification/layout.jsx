"use client";
import { useEffect } from 'react';
import './layout.scss';

export default function Notification({ text, type, onClose, isActive }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`notification ${type} ${isActive ? "active" : ""}`}>
            <div className="notification-content">
                <span className="notification-title">
                    {type === 'error' ? 'Error' : 'Success'}
                </span>
                <p>{text}</p>
            </div>
            <button className="notification-close" onClick={onClose}>
                +
            </button>
            <div className="notification-progress" />
        </div>
    );
}
