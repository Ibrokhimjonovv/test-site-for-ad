"use client";

import { createContext, useEffect, useState } from "react";

const AccessContext = createContext();

const AccessProvider = ({ children }) => {
    const [loginStat, setLoginStat] = useState(false);
    const [registerStat, setRegisterStat] = useState(false);

    // const [access, setAccess] = useState(false);
    // useEffect(() => {
    //     const savedAccess = localStorage.getItem("access");
    //     if (savedAccess) {
    //         setAccess(true)
    //     }
    // }, [])

    useEffect(() => {
        if (loginStat === true || registerStat === true) {
            document.body.classList.add("over");
        } else {
            document.body.classList.remove("over")
        }
    }, [loginStat, registerStat])



    const [profileLoading, setProfileLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);


    useEffect(() => {
        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const token = localStorage.getItem("accessEdu");

                const response = await fetch('/site/me', { // API route'ga yo'naltirish
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Tarmoq xatosi: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                setProfileData(data);
            } catch (error) {
                console.error("Failed to fetch profile data:", error.message);
                // Foydalanuvchiga xato haqida xabar berish
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const [allUsers, setAllUsers] = useState([]);


    useEffect(() => {
        const users = async () => {
            try {
                const response = await fetch(`https://test.smartcoders.uz/api/users_count/`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Tarmoq xatosi: ${response.status} - ${errorText}`);
                }

                const data = await response.json();

                // Ma'lumot obyekt yoki ro'yxat bo'lsa, setProfileData orqali holatga solamiz
                setAllUsers(data);


            } catch (error) {
                console.error("Failed to fetch profile data:", error.message);
            }
        };

        users();
    }, []);

    return (
        <AccessContext.Provider
            value={{
                loginStat,
                setLoginStat,
                registerStat,
                setRegisterStat,
                profileData, setProfileData, allUsers, profileLoading, setProfileLoading
            }}
        >
            {children}
        </AccessContext.Provider>
    );
};

export { AccessContext, AccessProvider };
