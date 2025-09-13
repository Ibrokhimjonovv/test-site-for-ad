"use client";

import Notification from "@/components/notification/layout";
import { api } from "@/config";
import { createContext, useEffect, useState } from "react";

const AccessContext = createContext();

const AccessProvider = ({ children }) => {
    const [loginStat, setLoginStat] = useState(false);
    const [registerStat, setRegisterStat] = useState(false);

    useEffect(() => {
        if (loginStat === true || registerStat === true) {
            document.body.classList.add("over");
        } else {
            document.body.classList.remove("over");
        }
    }, [loginStat, registerStat]);

    const [profileLoading, setProfileLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const token = localStorage.getItem("accessEdu");

                const response = await fetch("/site/me", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Network error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error("Failed to fetch profile data:", error.message);
                // Show error message to user
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const [allUsers, setAllUsers] = useState([]);

    const [notification, setNotification] = useState(null);
    const [showNotification, setShowNotification] = useState(false);

    // Combined notification function with reload support
    const showNewNotification = (text, type, options = {}) => {
        const { persist = false, reloadAfter = false } = options;
        const newNotification = {
            text,
            type,
            timestamp: Date.now(),
        };

        // Show immediately
        setNotification(newNotification);
        setShowNotification(true);

        // Persist to localStorage if needed
        if (persist) {
            localStorage.setItem(
                "pendingNotification",
                JSON.stringify({
                    ...newNotification,
                    // Extended lifetime for reload cases
                    extendedLifetime: reloadAfter,
                })
            );
        }

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
            setShowNotification(false);
            setTimeout(() => {
                setNotification(null);
                if (!reloadAfter) {
                    localStorage.removeItem("pendingNotification");
                }
            }, 300);
        }, 5000);

        // Handle page reload if needed
        if (reloadAfter) {
            setTimeout(() => {
                window.location.reload();
            }, 100); // Small delay to ensure notification is stored
        }

        return () => clearTimeout(timer);
    };

    // Check for pending notifications on mount (with extended lifetime support)
    useEffect(() => {
        const checkForNotifications = () => {
            const storedNotification = localStorage.getItem("pendingNotification");
            if (storedNotification) {
                const parsedNotification = JSON.parse(storedNotification);

                // Extended lifetime check (30 seconds for reload cases)
                const maxAge = parsedNotification.extendedLifetime ? 30000 : 10000;

                if (Date.now() - parsedNotification.timestamp < maxAge) {
                    setNotification(parsedNotification);
                    setShowNotification(true);

                    // Auto-hide after remaining time
                    const remainingTime = Math.max(
                        1000,
                        maxAge - (Date.now() - parsedNotification.timestamp)
                    );

                    setTimeout(() => {
                        setShowNotification(false);
                        setTimeout(() => {
                            setNotification(null);
                            localStorage.removeItem("pendingNotification");
                        }, 300);
                    }, remainingTime);
                } else {
                    localStorage.removeItem("pendingNotification");
                }
            }
        };

        checkForNotifications();
        window.addEventListener("popstate", checkForNotifications);
        return () => window.removeEventListener("popstate", checkForNotifications);
    }, []);

    return (
        <AccessContext.Provider
            value={{
                loginStat,
                setLoginStat,
                registerStat,
                setRegisterStat,
                profileData,
                setProfileData,
                allUsers,
                profileLoading,
                setProfileLoading,
                notification,
                showNewNotification,
            }}
        >
            {children}
            <Notification
                isActive={showNotification}
                text={notification?.text}
                type={notification?.type}
                onClose={() => {
                    setShowNotification(false);
                    setNotification(null);
                }}
            />
        </AccessContext.Provider>
    );
};

export { AccessContext, AccessProvider };
