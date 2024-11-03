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

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  bgColor: string;
  ariaLabel: string;
  extraContent?: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onClick,
  icon,
  label,
  bgColor,
  ariaLabel,
  extraContent,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 ${bgColor} text-white py-2 px-4 rounded-md hover:opacity-90 transition duration-200`}
    aria-label={ariaLabel}
  >
    {icon}
    <span>{label}</span>
    {extraContent}
  </button>
);

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

  const toolbarButtons = [
    {
      onClick: () => setShowColorPicker(true),
      icon: <FiPenTool size={20} />,
      label: "Pen Color",
      bgColor: "bg-blue-500",
      ariaLabel: "Choose Pen Color",
      extraContent: (
        <>
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: drawColor }}
          ></div>
          {showColorPicker && (
            <ColorPicker
              color={drawColor}
              onChange={handleColorChange}
              isVisible={showColorPicker}
              toggleVisibility={() => setShowColorPicker(false)}
            />
          )}
        </>
      ),
    },
    {
      onClick: handleAddText,
      icon: <FiType size={20} />,
      label: "Add Text",
      bgColor: "bg-purple-500",
      ariaLabel: "Add Text",
    },
    {
      onClick: undo,
      icon: <FaUndo size={20} />,
      label: "Undo",
      bgColor: "bg-gray-500",
      ariaLabel: "Undo Last Action",
    },
    {
      onClick: handleCopyToClipboard,
      icon: <FiCopy size={20} />,
      label: "Copy",
      bgColor: "bg-yellow-500",
      ariaLabel: "Copy to Clipboard",
    },
    {
      onClick: handleDownload,
      icon: <FiDownload size={20} />,
      label: "Download",
      bgColor: "bg-green-500",
      ariaLabel: "Download Image",
    },
  ];

  return (
    <div className="flex justify-between items-center mt-6 flex-wrap gap-2">
      <div className="flex space-x-3">
        {toolbarButtons.slice(0, 3).map((button, index) => (
          <ToolbarButton key={index} {...button} />
        ))}
      </div>
      <div className="flex space-x-4">
        {toolbarButtons.slice(3).map((button, index) => (
          <ToolbarButton key={index + 3} {...button} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(Toolbar);
