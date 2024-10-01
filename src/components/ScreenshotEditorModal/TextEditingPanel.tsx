import React, { useState } from "react";
import ColorPicker from "../ColorPicker";

interface TextEditingPanelProps {
  editingText: string;
  setEditingText: (text: string) => void;
  editingFontSize: number;
  setEditingFontSize: (size: number) => void;
  editingColor: string;
  setEditingColor: (color: string) => void;
  editingOpacity: number;
  setEditingOpacity: (opacity: number) => void;
  applyTextEdits: () => void;
  cancelTextEditing: () => void;
}

const TextEditingPanel: React.FC<TextEditingPanelProps> = ({
  editingText,
  setEditingText,
  editingFontSize,
  setEditingFontSize,
  editingColor,
  setEditingColor,
  editingOpacity,
  setEditingOpacity,
  applyTextEdits,
  cancelTextEditing,
}) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  const handleTextColorChange = (color: any) => {
    setEditingColor(color.hex);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 1) {
      setEditingFontSize(value);
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= 0 && value <= 100) {
      setEditingOpacity(value);
    }
  };

  return (
    <div className="mt-4 p-6 rounded-[10px] border border-stroke bg-white shadow-1 dark:border-darkgray-3 dark:bg-darkgray-2 dark:shadow-card">
      <h3 className="text-lg font-medium mb-4 text-darkgray dark:text-white">
        Text Properties
      </h3>
      <div className="flex flex-col space-y-5">
        <label className="block text-body-sm font-medium text-darkgray dark:text-white">
          Content:
          <input
            type="text"
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="mt-1 w-full rounded-[7px] border-[1.5px] border-stroke bg-white py-2.5 px-4 text-darkgray focus:border-primary focus-visible:outline-none dark:border-darkgray-3 dark:bg-darkgray-2 dark:text-white dark:focus:border-primary"
          />
        </label>
        <label className="block text-body-sm font-medium text-darkgray dark:text-white">
          Font Size:
          <input
            type="number"
            min={1}
            value={editingFontSize}
            onChange={handleFontSizeChange}
            className="mt-1 w-full rounded-[7px] border-[1.5px] border-stroke bg-white py-2.5 px-4 text-darkgray focus:border-primary focus-visible:outline-none dark:border-darkgray-3 dark:bg-darkgray-2 dark:text-white dark:focus:border-primary"
          />
        </label>
        <label className="block text-body-sm font-medium text-darkgray dark:text-white">
          Opacity (%):
          <input
            type="number"
            min={0}
            max={100}
            value={editingOpacity}
            onChange={handleOpacityChange}
            className="mt-1 w-full rounded-[7px] border-[1.5px] border-stroke bg-white py-2.5 px-4 text-darkgray focus:border-primary focus-visible:outline-none dark:border-darkgray-3 dark:bg-darkgray-2 dark:text-white dark:focus:border-primary"
          />
        </label>
        <label className="block text-body-sm font-medium text-darkgray dark:text-white">
          Color:
          <div className="flex items-center space-x-2 mt-2">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: editingColor }}
            ></div>
            <button
              onClick={() => setShowColorPicker(true)}
              className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 dark:bg-darkgray-3 dark:hover:bg-darkgray-2 dark:text-white transition"
            >
              Choose Color
            </button>
            <ColorPicker
              color={editingColor}
              onChange={handleTextColorChange}
              isVisible={showColorPicker}
              toggleVisibility={() => setShowColorPicker(false)}
            />
          </div>
        </label>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={cancelTextEditing}
            className="rounded-[7px] border border-stroke px-6 py-2.5 text-darkgray hover:shadow-md dark:border-darkgray-3 dark:text-white"
          >
            Cancel
          </button>
          <button
            onClick={applyTextEdits}
            className="rounded-[7px] bg-primary px-6 py-2.5 text-white hover:bg-opacity-90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditingPanel;
