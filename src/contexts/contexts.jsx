"use client";

import { createContext, useEffect, useState } from "react";

const AccessContext = createContext();

const AccessProvider = ({ children }) => {
    const [loginStat, setLoginStat] = useState(false);
    const [registerStat, setRegisterStat] = useState(false);

    useEffect(() => {
        if(loginStat === true || registerStat === true) {
            document.body.classList.add("over");
        } else {
            document.body.classList.remove("over")
        }
    }, [loginStat, registerStat])

    return (
        <AccessContext.Provider
            value={{
                loginStat,
                setLoginStat,
                registerStat,
                setRegisterStat,
            }}
        >
            {children}
        </AccessContext.Provider>
    );
};

export { AccessContext, AccessProvider };
