'use client';

import { createContext, useContext } from 'react';

type Role = "ADMIN" | "MANAGER" | "STAFF";

const RoleContext = createContext<Role>("STAFF");

export function RoleProvider({ role, children }: { role: Role; children: React.ReactNode }) {
    return (
        <RoleContext.Provider value={role}>
            {children}
        </RoleContext.Provider>
    );
}

export const useRole = () => useContext(RoleContext);