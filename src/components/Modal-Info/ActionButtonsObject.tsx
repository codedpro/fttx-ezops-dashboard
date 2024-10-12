import React from "react";

interface ActionButtonsProps {
  handleEditObject: () => void;
  handleDeleteObject: () => void;
}

export const ActionButtonsObject: React.FC<ActionButtonsProps> = ({
  handleEditObject,
  handleDeleteObject,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 w-full mt-4">
      <button
        onClick={handleEditObject}
        className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-base rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Edit
      </button>
      <button
        onClick={handleDeleteObject}
        className="flex-1 px-4 py-2 bg-red-600 text-white text-base rounded-md hover:bg-red-700 transition-transform duration-300 ease-in-out transform hover:scale-105"
      >
        Delete Object
      </button>
    </div>
  );
};
