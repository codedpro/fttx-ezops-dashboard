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
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-4">
      <button
        onClick={onEditPosition}
        className="bg-white p-4 rounded-full shadow-lg"
      >
        <FaEdit size={24} />
      </button>
      <button
        onClick={onSuggestFATLine}
        className="bg-white p-4 rounded-full shadow-lg"
      >
        <FaRoad size={24} />
      </button>
      <button
        onClick={onCustomFATLine}
        className="bg-white p-4 rounded-full shadow-lg"
      >
        <FaDrawPolygon size={24} />
      </button>
      <button
        onClick={onExitEditMode}
        className="bg-red-600 p-4 rounded-full shadow-lg text-white"
      >
        <FaTimes size={24} />
      </button>

      {isEditingPosition && currentCoordinates && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg">
          <p>Editing Point...</p>
          <p>Latitude: {currentCoordinates.lat.toFixed(6)}</p>
          <p>Longitude: {currentCoordinates.lng.toFixed(6)}</p>
          <button
            onClick={handleSubmitEdit}
            className="px-4 py-2 bg-green-600 text-white rounded mr-4"
          >
            Save
          </button>
          <button
            onClick={handleCancelEdit}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      )}

      {isPathPanelOpen && selectedPath && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg">
          <p>Selected Path</p>
          <p>FAT Name: {selectedPath.FAT_Name}</p>
          <p>Do you want to save this path?</p>
          <button
            onClick={handleSavePath}
            className="px-4 py-2 bg-green-600 text-white rounded mr-4"
          >
            Save
          </button>
          <button
            onClick={handleCancelPath}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default EditPanel;
