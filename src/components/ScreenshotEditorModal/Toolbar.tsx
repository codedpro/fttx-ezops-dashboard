import React from "react";
import { FiPenTool, FiType, FiDownload, FiCopy } from "react-icons/fi";
import { FaUndo } from "react-icons/fa";
import ColorPicker from "../ColorPicker";

interface ToolbarProps {
  drawColor: string;
  setDrawColor: (color: string) => void;
  handleAddText: () => void;
  undo: () => void;
  handleCopyToClipboard: () => void;
  handleDownload: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  drawColor,
  setDrawColor,
  handleAddText,
  undo,
  handleCopyToClipboard,
  handleDownload,
}) => {
  const [showColorPicker, setShowColorPicker] = React.useState(false);

  const handleColorChange = (color: any) => {
    setDrawColor(color.hex);
  };

  return (
    <div className="flex justify-between items-center mt-6">
      <div className="flex space-x-3">
        <button
          onClick={() => setShowColorPicker(true)}
          className="flex items-center space-x-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
        >
          <FiPenTool size={20} />
          <span>Pen Color</span>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: drawColor }}
          ></div>
        </button>
        <ColorPicker
          color={drawColor}
          onChange={handleColorChange}
          isVisible={showColorPicker}
          toggleVisibility={() => setShowColorPicker(false)}
        />

        <button
          onClick={handleAddText}
          className="flex items-center space-x-2 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition duration-200"
        >
          <FiType size={20} />
          <span>Add Text</span>
        </button>

        <button
          onClick={undo}
          className="flex items-center space-x-2 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
        >
          <FaUndo size={20} />
          <span>Undo</span>
        </button>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleCopyToClipboard}
          className="flex items-center space-x-2 bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 transition duration-200"
        >
          <FiCopy size={20} />
          <span>Copy</span>
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-200"
        >
          <FiDownload size={20} />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
