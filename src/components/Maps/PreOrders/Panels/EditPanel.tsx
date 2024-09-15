import React, { useEffect, useState } from "react";
import {
  FaEdit,
  FaRoad,
  FaDrawPolygon,
  FaSave,
  FaUndo,
  FaTimes,
  FaPalette,
} from "react-icons/fa";
import { TwitterPicker } from "react-color";

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
  handleUndoCustomLine: () => void;
  handleColorChange: (color: string) => void;
  isDrawingLine: boolean;
  lineColor: string;
  handleSaveCustomLine: () => void;
  handleCancelCustomLine: () => void;
  isSuggestingFATLine: boolean;
  handleCancelSuggestingFATLine: () => void;
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
  handleSaveCustomLine,
  handleUndoCustomLine,
  handleCancelCustomLine,
  handleColorChange,
  isDrawingLine,
  lineColor,
  isSuggestingFATLine,
  handleCancelSuggestingFATLine,
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    console.log(selectedPath);
  }, [selectedPath]);

  return (
    <div className="absolute text-xs bottom-4 w-full left-1/2 transform -translate-x-1/2 z-50 flex flex-wrap justify-center items-center space-x-2 sm:space-x-4">
      {!isDrawingLine && !isEditingPosition && !isSuggestingFATLine && (
        <>
          {" "}
          <button
            onClick={onEditPosition}
            className="bg-gray-100 dark:bg-[#2a3b4d] p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
          >
            <FaEdit size={16} className="text-primary" />
            <span className="text-primary">Edit Position</span>
          </button>
          <button
            onClick={onSuggestFATLine}
            className="bg-gray-100 dark:bg-[#2a3b4d] p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
          >
            <FaRoad size={16} className="text-primary" />
            <span className="text-primary">Suggest FAT Line</span>
          </button>
          <button
            onClick={onCustomFATLine}
            className="bg-gray-100 dark:bg-[#2a3b4d] p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
          >
            <FaDrawPolygon size={16} className="text-primary" />
            <span className="text-primary">Custom FAT Line</span>
          </button>
        </>
      )}

      {isDrawingLine && (
        <button
          onClick={handleSaveCustomLine}
          className="bg-green-600 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
        >
          <FaSave size={16} />
          <span>Save Line</span>
        </button>
      )}

      {isDrawingLine && (
        <button
          onClick={handleUndoCustomLine}
          className="bg-yellow-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
        >
          <FaUndo size={16} />
          <span>Undo</span>
        </button>
      )}

      {isDrawingLine && (
        <button
          onClick={handleCancelCustomLine}
          className="bg-red-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
        >
          <FaTimes size={16} />
          <span>Cancel</span>
        </button>
      )}

      {/* Line Color Picker */}
      {isDrawingLine && (
        <>
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="bg-blue-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
          >
            <FaPalette size={16} />
            <span>Color</span>
          </button>

          {isColorPickerOpen && (
            <div className="absolute bottom-20 z-50">
              <TwitterPicker
                color={lineColor}
                onChangeComplete={(color) => handleColorChange(color.hex)}
              />
            </div>
          )}
        </>
      )}

      {/* Exit Edit Mode Button */}
      {!isDrawingLine && !isSuggestingFATLine && !isEditingPosition && (
        <button
          onClick={onExitEditMode}
          className="bg-red-500 p-4 rounded-full shadow-lg text-white transition-transform hover:scale-105 flex items-center space-x-2"
        >
          <FaTimes size={16} />
          <span>Exit</span>
        </button>
      )}
      {/* Editing Position Panel */}
      {isEditingPosition && currentCoordinates && (
        <div className="absolute bottom-4 right-4 transform translate-x-0 bg-white dark:bg-[#1f2937] p-4 rounded-lg shadow-lg transition-all max-w-sm sm:max-w-md lg:max-w-lg">
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

      {isSuggestingFATLine && (
        <button
          onClick={handleCancelSuggestingFATLine} // Adjust to your handleCancel method
          className="bg-red-500 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2"
        >
          <FaTimes size={16} />
          <span>Cancel FAT Line</span>
        </button>
      )}

      {/* Path Panel */}
      {isPathPanelOpen && selectedPath && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-[#1f2937] p-4 rounded-lg shadow-lg transition-all max-w-sm sm:max-w-md lg:max-w-lg">
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Selected Path
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            FAT Name: {selectedPath.FAT_Name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            FAT ID: {selectedPath.FAT_ID}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Distance: {selectedPath.realDistance}
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
