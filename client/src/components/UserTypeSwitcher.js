import React from 'react';
import { useCategory } from '../contexts/CategoryContext';

const UserTypeSwitcher = () => {
  const { userType, setUserTypeManually } = useCategory();

  const userTypes = [
    { value: 'all', label: 'General User' },
    { value: 'student', label: 'Student' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'professional', label: 'Professional' },
    { value: 'admin', label: 'Admin' }
  ];

  const handleUserTypeChange = (e) => {
    setUserTypeManually(e.target.value);
    window.location.reload(); // Reload to apply changes
  };

  return (
    <div className="user-type-switcher bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/10">
            <span className="text-sm">👤</span>
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">User Type</h3>
            <p className="text-xs text-gray-400">Different users see different categories</p>
          </div>
        </div>
        
        <select
          value={userType}
          onChange={handleUserTypeChange}
          className="bg-white/10 backdrop-blur-sm text-white text-sm py-2 px-3 rounded-lg border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
        >
          {userTypes.map(type => (
            <option key={type.value} value={type.value} className="bg-gray-800 text-white">
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UserTypeSwitcher;
