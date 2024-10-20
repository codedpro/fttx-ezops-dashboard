import React from "react";

interface ActionButtonsProps {
  handleEditLine: () => void;
  handleAddObjectClick: () => void;
  handleDeleteLine: () => void;
  handleEditDetailLine: () => void;
  handleConnectLine: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  handleEditLine,
  handleAddObjectClick,
  handleDeleteLine,
  handleConnectLine,
  handleEditDetailLine,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-full mt-4">
      <button
        onClick={handleEditLine}
        className="flex-1 min-w-[120px] px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-base rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Edit Line
      </button>
      <button
        onClick={handleAddObjectClick}
        className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 dark:bg-green-500 text-white text-base rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Add Object
      </button>
      <button
        onClick={handleDeleteLine}
        className="flex-1 min-w-[120px] px-4 py-2 bg-red-600 text-white text-base rounded-md hover:bg-red-700 transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Delete Line
      </button>
      <button
        onClick={handleEditDetailLine}
        className="flex-1 min-w-[120px] px-4 py-2 bg-primary  text-white text-base rounded-md hover:bg-primaryhover  transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Edit Details
      </button>
      <button
        onClick={handleConnectLine}
        className="flex-1 min-w-[120px] px-4 py-2 bg-orange-600  text-white text-base rounded-md hover:bg-orange-700  transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Connect line
      </button>
    </div>
  );
};
