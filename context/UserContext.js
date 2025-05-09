import React, { createContext, useState } from 'react';

// Create context for user data
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({ name: '', email: '' }); // Shared user state

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children} {/* This allows any children components to access the context */}
    </UserContext.Provider>
  );
}
