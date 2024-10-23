import React, { createContext, useState } from 'react';

// Create the context
const AdminContext = createContext();

// Create a provider component
export const AdminProvider = ({ children }) => {
  const [adminProfile, setAdminProfile] = useState(null);

  return (
    <AdminContext.Provider value={{ adminProfile, setAdminProfile }}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
