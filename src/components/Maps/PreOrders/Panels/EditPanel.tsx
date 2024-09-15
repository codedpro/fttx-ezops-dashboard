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
          <ActionButton
            onClick={onEditPosition}
            label="Edit Position"
            icon={FaEdit}
            bgColor="bg-green-500"
          />
          <ActionButton
            onClick={onSuggestFATLine}
            label="Suggest FAT Line"
            icon={FaRoad}
            bgColor="bg-orange-600"
          />
          <ActionButton
            onClick={onCustomFATLine}
            label="Custom FAT Line"
            icon={FaDrawPolygon}
            bgColor="bg-blue-600"
          />
        </>
      )}

      {isDrawingLine && (
        <>
          <ActionButton
            onClick={handleSaveCustomLine}
            label="Save Line"
            icon={FaSave}
            bgColor="bg-green-500"
          />
          <ActionButton
            onClick={handleUndoCustomLine}
            label="Undo"
            icon={FaUndo}
            bgColor="bg-yellow-500"
          />
          <ActionButton
            onClick={handleCancelCustomLine}
            label="Cancel"
            icon={FaTimes}
            bgColor="bg-red-500"
          />
          <ActionButton
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            label="Color"
            icon={FaPalette}
            bgColor="bg-blue-600"
          />

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

      {!isDrawingLine && !isSuggestingFATLine && !isEditingPosition && (
        <ActionButton
          onClick={onExitEditMode}
          label="Exit"
          icon={FaTimes}
          bgColor="bg-red-500"
        />
      )}

      {isEditingPosition && currentCoordinates && (
        <>
          <CoordinateButton
            label="Latitude"
            value={currentCoordinates.lat.toFixed(6)}
            bgColor="bg-orange-500"
          />
          <CoordinateButton
            label="Longitude"
            value={currentCoordinates.lng.toFixed(6)}
            bgColor="bg-orange-500"
          />
          <ActionButton
            onClick={handleSubmitEdit}
            label="Save Position"
            icon={FaSave}
            bgColor="bg-green-500"
          />
          <ActionButton
            onClick={handleCancelEdit}
            label="Cancel"
            icon={FaTimes}
            bgColor="bg-red-500"
          />
        </>
      )}

      {isSuggestingFATLine && !isPathPanelOpen && !selectedPath && (
        <ActionButton
          onClick={handleCancelSuggestingFATLine}
          label="Cancel FAT Line"
          icon={FaTimes}
          bgColor="bg-red-500"
        />
      )}

      {isPathPanelOpen && selectedPath && (
        <>
          <CoordinateButton
            label="FAT ID"
            value={selectedPath.FAT_ID}
            bgColor="bg-yellow-500"
          />
          <CoordinateButton
            label="Distance"
            value={selectedPath.realDistance.toFixed(2)}
            bgColor="bg-orange-500"
          />
          <ActionButton
            onClick={handleSavePath}
            label="Save Path"
            icon={FaSave}
            bgColor="bg-green-500"
          />
          <ActionButton
            onClick={handleCancelPath}
            label="Cancel"
            icon={FaTimes}
            bgColor="bg-red-500"
          />
        </>
      )}
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: () => void;
  label: string;
  icon: React.ComponentType<any>;
  bgColor?: string;
}> = ({ onClick, label, icon: Icon, bgColor = "bg-gray-100" }) => (
  <button
    onClick={onClick}
    className={`${bgColor} p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2`}
  >
    <Icon size={16} className="text-white" />
    <span className="text-white">{label}</span>
  </button>
);

const CoordinateButton: React.FC<{
  label: string;
  value: string | number;
  bgColor?: string;
}> = ({ label, value, bgColor = "bg-gray-100" }) => (
  <button
    className={`${bgColor} p-4 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center space-x-2`}
  >
    <span className="text-xs font-semibold text-white">{label}:</span>
    <span className="text-sm text-white">{value}</span>
  </button>
);

export default EditPanel;
