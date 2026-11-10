import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { endpoints } from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fastfood_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading fastfood_user from localStorage', e);
    }
    // Default demo user: Customer Nguyễn Văn An
    return {
      id: 2,
      username: 'nguyenvana',
      email: 'vana@gmail.com',
      fullName: 'Nguyễn Văn An',
      phone: '0912345678',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      address: 'Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội'
    };
  });

  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    // Fetch users for switch account feature
    api.get(endpoints.users)
      .then(res => setAvailableUsers(res.data))
      .catch(err => console.warn('Could not fetch users list:', err.message));
  }, []);

  const loginUser = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('fastfood_user', JSON.stringify(userObj));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('fastfood_user');
  };

  const updateProfile = async (formData) => {
    if (!currentUser) return false;
    try {
      const updated = { ...currentUser, ...formData };
      await api.patch(`${endpoints.users}/${currentUser.id}`, formData);
      setCurrentUser(updated);
      localStorage.setItem('fastfood_user', JSON.stringify(updated));
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        availableUsers,
        loginUser,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
