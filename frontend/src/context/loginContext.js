// context/loginContext.js
import React, { createContext, useState } from "react";

export const LoginContext = createContext();

export const LoginProvider = ({ children }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [login, setLogin] = useState(false); // Or derive this from more complex logic

    return (
        <LoginContext.Provider value={{ setModalOpen, login }}>
            {children}
        </LoginContext.Provider>
    );
};
