import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jhai_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const mockUser = { email, firstName: 'Arjun', lastName: 'Sharma' };
    localStorage.setItem('jhai_user', JSON.stringify(mockUser));
    localStorage.setItem('jhai_token', 'mock-token-123');
    setUser(mockUser);
    return mockUser;
  };

  const register = async (formData) => {
    const mockUser = { email: formData.email, firstName: formData.firstName, lastName: formData.lastName };
    localStorage.setItem('jhai_user', JSON.stringify(mockUser));
    localStorage.setItem('jhai_token', 'mock-token-123');
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('jhai_user');
    localStorage.removeItem('jhai_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);