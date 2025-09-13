"use client"

import { AccessContext } from '@/contexts/contexts';
import { useRouter } from 'next/navigation';
import React, { useContext } from 'react'

const Logout = () => {
    const { setProfileData, setProfileLoading } = useContext(AccessContext)
    const nav = useRouter()
    const handleLogout = () => {
        localStorage.removeItem("accessEdu");
        localStorage.removeItem("refreshEdu");

        setProfileData(null);
        setProfileLoading(false);

        window.location.href = "/";
        // try {
        //     nav.push("/");
        // } catch (e) {
        //     // Fallback to hard navigation if router fails
        // }
    };
    return (
        <button
            onClick={handleLogout}
        >
            Logout
        </button>
    )
}

export default Logout