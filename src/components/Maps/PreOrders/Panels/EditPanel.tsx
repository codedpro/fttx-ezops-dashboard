import React from "react";
import { FaEdit, FaRoad, FaDrawPolygon, FaTimes } from "react-icons/fa";

interface EditPanelProps {
  onEditPosition: () => void;
  onSuggestFATLine: () => void;
  onCustomFATLine: () => void;
  onExitEditMode: () => void;
  currentCoordinates: { lat: number; lng: number } | null;
  handleSubmitEdit: () => void;
  handleCancelEdit: () => void;
  isEditingPosition: boolean;
  isPathPanelOpen: boolean;
  handleSavePath: () => void;
  handleCancelPath: () => void;
  selectedPath: any;
}

const EditPanel: React.FC<EditPanelProps> = ({
  onEditPosition,
  onSuggestFATLine,
  onCustomFATLine,
  onExitEditMode,
  currentCoordinates,
  handleSubmitEdit,
  handleCancelEdit,
  isEditingPosition,
  isPathPanelOpen,
  handleSavePath,
  handleCancelPath,
  selectedPath,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-wrap justify-center items-center space-x-2 sm:space-x-4">
      <button
        onClick={onEditPosition}
        className="bg-gray-100 dark:bg-[#2a3b4d] p-4 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <FaEdit size={24} className="text-primary" />
      </button>
      <button
        onClick={onSuggestFATLine}
        className="bg-gray-100 dark:bg-[#2a3b4d] p-4 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <FaRoad size={24} className="text-primary" />
      </button>
      <button
        onClick={onCustomFATLine}
        className="bg-gray-100 dark:bg-[#2a3b4d] p-4 rounded-full shadow-lg transition-transform hover:scale-105"
      >
        <FaDrawPolygon size={24} className="text-primary" />
      </button>
      <button
        onClick={onExitEditMode}
        className="bg-red-500 p-4 rounded-full shadow-lg text-white transition-transform hover:scale-105"
      >
        <FaTimes size={24} />
      </button>

      {isEditingPosition && currentCoordinates && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1f2937] p-4 rounded-lg shadow-lg transition-all w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Editing Point
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latitude: {currentCoordinates.lat.toFixed(6)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Longitude: {currentCoordinates.lng.toFixed(6)}
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleSubmitEdit}
              className="px-4 py-2 bg-green-600 text-white rounded transition-all hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-red-600 text-white rounded transition-all hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isPathPanelOpen && selectedPath && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1f2937] p-4 rounded-lg shadow-lg transition-all w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Selected Path
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            FAT Name: {selectedPath.FAT_Name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Do you want to save this path?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={handleSavePath}
              className="px-4 py-2 bg-green-600 text-white rounded transition-all hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancelPath}
              className="px-4 py-2 bg-red-600 text-white rounded transition-all hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPanel;
