import React from "react";
export const ActionButton: React.FC<{
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}> = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white bg-opacity-50 dark:bg-[#1F2937] dark:text-gray-200 text-black dark:bg-opacity-60 backdrop-blur-lg p-3 mt-2 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
  >
    {icon && <div className="icon-wrapper  text-lg">{icon}</div>}
    <span className="">{label}</span>
  </button>
);
