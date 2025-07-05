import React from 'react';
import { useCategory } from '../contexts/CategoryContext';

const CategorySelector = ({ showChangeOption = true }) => {
  const { selectedCategory, getCategoryInfo } = useCategory();
  
  if (!selectedCategory) return null;
  
  const categoryInfo = getCategoryInfo(selectedCategory);
  
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    indigo: 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/30',
    teal: 'from-teal-500/20 to-teal-600/20 border-teal-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30'
  };
  
  const colorClass = colorClasses[categoryInfo?.color] || colorClasses.blue;
  
  return (
    <div className={`bg-gradient-to-r ${colorClass} backdrop-blur-md rounded-2xl p-6 border shadow-2xl mb-6 transition-all duration-300 hover:shadow-3xl`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <span className="text-2xl">{categoryInfo?.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Category Selected: {categoryInfo?.name}
            </h3>
            <p className="text-sm text-white/70">
              {categoryInfo?.description}
            </p>
            <p className="text-xs text-white/50 mt-1">
              You can only upload documents from this category
            </p>
          </div>
        </div>
        
        {showChangeOption && (
          <button
            onClick={() => window.history.back()}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium py-2 px-4 rounded-xl border border-white/20 transition-all duration-200 flex items-center space-x-2 hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Change Category</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CategorySelector;
